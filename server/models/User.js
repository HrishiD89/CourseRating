import mongoose from "mongoose";
import bcrypt from "bcrypt";

// mongoose schema
const userSchema = mongoose.Schema({
    name : { type : String , required : true },
    email : { type : String , required : true , unique : true , trim : true, lowercase : true},
    password : { type : String , required : true },
    role : { type : String , enum : ["user","admin"] , default : "user"}
})
// mongoose presave middleware for hash
userSchema.pre("save",async function(){
    if (!this.isModified("password")) return;
    this.password = await bcrypt.hash(this.password,10);
})
// mongoose coparepassword method
userSchema.methods.comparePassword = async function(password){
    return await bcrypt.compare(password,this.password);
}
// mongose model intialize and export 

const User = mongoose.model('User',userSchema);

export default User;