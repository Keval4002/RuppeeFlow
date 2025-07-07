import React, { useState } from 'react'
import Input from "../../components/Inputs/Input"
import EmojiPickerPopup from '../EmojiPickerPopup'

function AddExpenseForm({onAddExpense}) {

    const [expense, setExpense] = useState({
        category:"",
        amount:"",
        date:"",
        icon:""
    })

    const handleChange = (key, value)=>{
        setExpense({...expense, [key]:value});
    }
  return (
    <div>

        <EmojiPickerPopup 
        icon={expense.icon}
        onSelect={selectedIcon=>{handleChange("icon", selectedIcon)}}
        />

        <Input 
        value={expense.category}
        onChange={(e)=>{handleChange("category", e.target.value)}}
        label="Expense Category"
        placeHolder="Rent, Grocery, etc."
        type="text"
        />
        <Input 
        value={expense.amount}
        onChange={(e)=>{handleChange("amount", e.target.value)}}
        label="Amount"
        placeHolder=""
        type="number"
        />
        <Input 
        value={expense.date}
        onChange={(e)=>{handleChange("date", e.target.value)}}
        label="Date"
        placeHolder=""
        type="date"
        />

        <div className='flex justify-end mt-6'>
            <button className='add-btn add-btn-fill '
            type='button'
            onClick={()=>{onAddExpense(expense)}}
            >
                Add Expense
            </button>
        </div>
    </div>
  )
}

export default AddExpenseForm