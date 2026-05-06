import mongoose from "mongoose"

const IncomeSchema = new mongoose.Schema({
    userId: {type:mongoose.Schema.Types.ObjectId, ref:"User", required:true},
    icon: {type:String},
    source: {type:String, required:true}, //Example Freelance, Salary, etc.
    amount: {type:Number, required:true},
    date: {type:Date, default:Date.now},
}, {
    timestamps:true
});

// Compound indexes for query performance
IncomeSchema.index({ userId: 1, date: -1 });   // find + sort + date-range filters
IncomeSchema.index({ userId: 1, source: 1 });   // $group by source in aggregations

export default mongoose.model("Income", IncomeSchema);