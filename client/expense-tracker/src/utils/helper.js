import moment from "moment";

export function validateEmail(email) {
  const regex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return regex.test(email);
}

export const getInitials = (name)=>{
  if(!name) return "";

  const words= name.split(" ");
  let initials = "";

  for(let i=0; i<Math.min(words.length, 2); i++){
    initials+= words[i][0];
  }

  return initials.toUpperCase();
} 


export const addThousandsSeperator = (num) => {
  if (num == null || isNaN(num)) return "₹ 0.00";

  // Round to exactly 2 decimal places to avoid floating-point noise
  const rounded = parseFloat(Number(num).toFixed(2));
  const [integerPart, fractionalPart] = rounded.toString().split(".");
  const formattedInteger = integerPart.replace(/\B(?=(\d{3})+(?!\d))/g, ",");

  // Always show 2 decimal places
  const decimals = fractionalPart ? fractionalPart.padEnd(2, "0") : "00";

  return `₹ ${formattedInteger}.${decimals}`;
};

export const preparedExpenseBarChartData = (data = [])=>{
  const validData = Array.isArray(data) ? data : [];
  const chartData = validData.map((item)=>({
    category:item?.category,
    amount: Number(item?.amount).toFixed(2),
    month: moment(item?.date).format("MMM"),
  }))
  return chartData;
}

export const preparedIncomeBarChartData = (data = [])=>{
  const validData = Array.isArray(data) ? data : [];
  const sortedData = [...validData].sort((a, b) => new Date(a.date) - new Date(b.date));
  const chartData = sortedData.map((item)=>({
    source: item?.source,
    amount: Number(item?.amount).toFixed(2),
    month: moment(item?.date).format("MMM"),
  }))
  return chartData;
}

export const preparedExpenseLineChartData = (data = [])=>{
  const validData = Array.isArray(data) ? data : [];
  const sortedData = [...validData].sort((a, b) => new Date(a.date) - new Date(b.date));
  const chartData = sortedData.map((item)=>({
    category:item?.category,
    amount:Number(item?.amount).toFixed(2),
    month: moment(item?.date).format("MMM"),
  }))
  return chartData;
}

