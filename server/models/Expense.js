    import mongoose from "mongoose"

    const ExpenseSchema = new mongoose.Schema({
        userId: {type:mongoose.Schema.Types.ObjectId, ref:"User", required:true},
        icon: {type:String},
        category: {type:String, required:true}, //Example Food, Rent, etc.
        amount: {type:Number, required:true},
        date: {type:Date, default:Date.now},
    }, {
        timestamps:true
    });

    // Compound indexes for query performance
    ExpenseSchema.index({ userId: 1, date: -1 });    // find + sort + date-range filters
    ExpenseSchema.index({ userId: 1, category: 1 });  // $group by category in aggregations

    export default mongoose.model("Expense", ExpenseSchema);