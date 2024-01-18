import mongoose, {Schema} from "mongoose"

const subscriptionSchema = new Schema({
    subscriber: {
        type: Schema.Types.ObjectId,// one who is subscribing, you
        ref: User
    },
    channel:{
        type: Schema.Types.ObjectId,// pewdiepie
        ref: User
    }
}, {timestamps: true})

export const Subscription = mongoose.model("Subscription", subscriptionSchema)