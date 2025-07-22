import mongoose, { Schema, Document, Model } from "mongoose";
interface PhotoAttrs {
    user: mongoose.Schema.Types.ObjectId;
    url: string;
    thumbnailUrl: string;
    width?: number;
    height?: number;
    fileType?: string;
}

interface UserPhotoDoc extends Document {
    user: mongoose.Schema.Types.ObjectId;
    url: string;
    thumbnailUrl: string;
    width?: number;
    height?: number;
    createdAt: Date;
    updatedAt: Date;
    fileType?: string;
}

interface UserPhotoModel extends Model<UserPhotoDoc> {
    build(attrs: PhotoAttrs): UserPhotoDoc;
}


// ** Fotoğraf Şeması Tanımlama **
const userPhotoSchema = new Schema<UserPhotoDoc>(
    {
        user: { type: Schema.Types.ObjectId, ref: "User", required: true },
        url: { type: String, required: true },
        thumbnailUrl: { type: String, required: true },
        width: { type: Number },
        height: { type: Number },
        fileType: { type: String, default: "image/jpeg" },
    },
    { timestamps: true }
);

// ** Fotoğraf Oluşturma Metodu **
userPhotoSchema.statics.build = (attrs: PhotoAttrs) => {
    return new UserPhoto(attrs);
};

// ** Fotoğraf Modelini Oluşturma **
const UserPhoto = mongoose.model<UserPhotoDoc, UserPhotoModel>("UserPhoto", userPhotoSchema);

export { UserPhoto };
