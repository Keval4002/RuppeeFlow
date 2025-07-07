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
  if (num == null || isNaN(num)) return "₹ 0";

  const [integerPart, fractionalPart] = num.toString().split(".");
  const formattedInteger = integerPart.replace(/\B(?=(\d{3})+(?!\d))/g, ",");

  const formatted = fractionalPart
    ? `${formattedInteger}.${fractionalPart}`
    : formattedInteger;

  return `₹ ${formatted}`;
};

export const preparedExpenseBarChartData = (data = [])=>{
  const chartData = data.map((item)=>({
    category:item?.category,
    amount:item?.amount,
    month: moment(item?.date).format("MMM"),
  }))
  // console.log(chartData);
  return chartData;
}

export const preparedIncomeBarChartData = (data = [])=>{
  const sortedData = [...data].sort((a,b)=>{new Date(a.date)-new Date(b.date)});

    const chartData = sortedData.map((item)=>({
    source:item?.category,
    amount:item?.amount,
    month: moment(item?.date).format("MMM"),
  }))
  // console.log(chartData);
  return chartData;
}

export const preparedExpenseLineChartData = (data = [])=>{
  const sortedData = [...data].sort((a, b) => new Date(a.date) - new Date(b.date));

    const chartData = sortedData.map((item)=>({
    category:item?.category,
    amount:item?.amount,
    month: moment(item?.date).format("MMM"),
  }))
  // console.log(chartData);
  return chartData;
}

