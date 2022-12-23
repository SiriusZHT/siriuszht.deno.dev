// Lib for load config
import { config as loadEnv } from "https://deno.land/std@0.151.0/dotenv/mod.ts";
import { Application, Router } from "https://deno.land/x/oak@v10.6.0/mod.ts";
import "https://deno.land/x/xhr@0.2.0/mod.ts";
import { installGlobals } from "https://deno.land/x/virtualstorage@0.1.0/mod.ts";
import { initializeApp } from "https://cdn.skypack.dev/firebase@9.9.1/app";
import {
  addDoc,
  getFirestore,
  collection,
  getDocs,
} from "https://cdn.skypack.dev/firebase@9.9.1/firestore";
import {
  getDownloadURL,
  uploadBytes,
  getStorage,
  ref,
} from "https://cdn.skypack.dev/firebase@9.9.1/storage";

// Set up globals for Firebase
installGlobals();

// Set up server app
const port = 3000;
const app = new Application();

// Set up firebase
await loadEnv({ export: true });
const firebaseApp = initializeApp({
  apiKey: Deno.env.get("API_KEY"),
  authDomain: Deno.env.get("AUTH_DOMAIN"),
  projectId: Deno.env.get("PROJECT_ID"),
  storageBucket: Deno.env.get("STORAGE_BUCKET"),
  messagingSenderId: Deno.env.get("MESSAGING_SENDER_ID"),
  appId: Deno.env.get("APP_ID"),
});

// Set up firebase database
const db = getFirestore(firebaseApp);
const storage = getStorage();

// Set up routes
const router = new Router();
router.get("/bilbies", async (ctx, next) => {
  try {
    const colRef = collection(db, "bilbies");
    const { docs } = await getDocs(colRef);
    ctx.response.body = JSON.stringify({
      v: 1,
      data: docs.map((doc) => ({ _id: doc.id, ...doc.data() })),
    });
  } catch (err) {
    const status = 500;
    ctx.response.status = status;
    ctx.response.body = JSON.stringify({
      error: { message: err.message, status },
    });
  }
});

router.post("/bilbies", async (ctx) => {
  try {
    // Temp code to run off POST
    if (!Deno.env.get("POST_BILBIES")) {
      ctx.response.status = 403;
      return (ctx.response.body = JSON.stringify({
        error: { message: "Upload currently not supported", status: 403 },
      }));
    }

    const body = await ctx.request.body({
      type: "form-data",
    });
    const { fields, files } = await body.value.read({ maxSize: 2_000_000 });

    if (!files) {
      const status = 400;
      const message = "No image was provided";
      ctx.response.status = status;
      ctx.response.body = JSON.stringify({
        error: { message, status },
      });
      return;
    }

    const file = files[0];
    if (files.length > 1 || file.name !== "image") {
      const status = 400;
      const message =
        "Only one image is allowed and it must use the correct file key: image";
      ctx.response.status = status;
      ctx.response.body = JSON.stringify({
        error: { message, status },
      });
      return;
    }

    if (!file.content) {
      const status = 400;
      const message = "Image is larger than the 2mb limit";
      ctx.response.status = status;
      ctx.response.body = JSON.stringify({
        error: { message, status },
      });
      return;
    }

    if (file.contentType !== "image/jpeg" && file.contentType !== "image/jpg") {
      const status = 400;
      const message = "Only JPEG images are supported";
      ctx.response.status = status;
      ctx.response.body = JSON.stringify({
        error: { message, status },
      });
      return;
    }

    if (!fields.alt) {
      const status = 400;
      const message = "No alt description was provided";
      ctx.response.status = status;
      ctx.response.body = JSON.stringify({
        error: { message, status },
      });
      return;
    }

    // Save image and update JSON file
    const colRef = collection(db, "bilbies");
    const { docs } = await getDocs(colRef);
    const storageRef = ref(storage, `bilbies-${docs.length + 1}.jpeg`);
    const snapshot = await uploadBytes(storageRef, file.content, {
      contentType: "image/jpeg",
    });

    // Get full url from firebase upload
    const url = await getDownloadURL(snapshot.ref);
    await addDoc(collection(db, "bilbies"), {
      alt: fields.alt,
      img: url,
    });

    ctx.response.status = 200;
  } catch (err) {
    const status = 500;
    ctx.response.status = status;
    ctx.response.body = JSON.stringify({
      error: { message: err.message, status },
    });
  }
});

app.use(router.routes());
app.use(router.allowedMethods());

app.addEventListener("listen", () => {
  console.log(`Listening on localhost:${port}`);
});

await app.listen({ port });