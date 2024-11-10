import { Router } from "express";
 import { addProduct ,getAllProducts} from "../contoller/product.controller.js";
 import {upload} from '../middleware/multer.middleware.js'

  const router = new Router()
   router.route("/addProduct").post(
    upload.fields(
        [
            {
                name:"images",
                maxCount:1
            }
        ]
    ),
    addProduct
   )

   router.route("/getAllProduct").get(
    getAllProducts
   );

   export default router;