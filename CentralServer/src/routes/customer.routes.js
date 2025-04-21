import {Router} from "express"
import { upload } from "../middlewares/multer.middleware.js"
import { customerEntryController, customerExitController, getCustomerInfo, submitReason } from "../controllers/customer.controllers.js"
import { verifyJWT } from "../middlewares/auth.middleware.js"

const router = Router()


router.route("/customer-entry").post(upload.fields([{name:'customerPhoto',maxCount:1},{name:'objectPhoto',maxCount:1},{name:'xrayPhoto',maxCount:1}]),customerEntryController)
router.route("/customer-exit").post(upload.fields([{name:'customerPhoto',maxCount:1},{name:'objectPhoto',maxCount:1},{name:'xrayPhoto',maxCount:1}]),customerExitController)
router.route("/get-customer").post(getCustomerInfo)
router.route("/submit-reason").post(upload.single('reason'),submitReason)


export default router