const inventory = [
  { cat:"Electronics", name:"Laptop", stock:50, exp:"2026-05-10" },
  { cat:"Electronics", name:"Mobile", stock:90, exp:"2026-03-15" },
  { cat:"Groceries", name:"Rice", stock:150, exp:"2026-02-20" },
  { cat:"Groceries", name:"Milk", stock:15, exp:"2024-12-28" },
  { cat:"Groceries", name:"Bread", stock:10, exp:"2024-12-20" },
  { cat:"Stationery", name:"Pen", stock:300, exp:"2027-06-01" },
  { cat:"Stationery", name:"Notebook", stock:120, exp:"2027-01-10" },
  { cat:"Electronics", name:"Headphones", stock:25, exp:"2026-09-10" }
];

let totalStock=0, expired=0, low=0;
const table = document.getElementById("table");

inventory.forEach(p=>{
  totalStock += p.stock;
  let status="Good", cls="good";

  if(new Date(p.exp) < new Date()){
    status="Expired"; cls="expired"; expired++;
  } else if(p.stock < 20){
    status="Low"; cls="low"; low++;
  }

  table.innerHTML += `
    <tr>
      <td>${p.cat}</td>
      <td>${p.name}</td>
      <td>${p.stock}</td>
      <td>${p.exp}</td>
      <td class="${cls}">${status}</td>
    </tr>`;
});

animate("pCount", inventory.length);
animate("tStock", totalStock);
animate("low", low);
animate("exp", expired);

// Charts
const labels = inventory.map(p=>p.name);
const values = inventory.map(p=>p.stock);

new Chart(barChart,{
  type:"bar",
  data:{ labels, datasets:[{ data:values }] }
});

new Chart(pieChart,{
  type:"pie",
  data:{ labels, datasets:[{ data:values }] }
});

new Chart(lineChart,{
  type:"line",
  data:{
    labels:["Jan","Feb","Mar","Apr","May"],
    datasets:[{ data:[400,600,550,700,850], tension:0.4 }]
  }
});

function animate(id,value){
  let i=0;
  const el=document.getElementById(id);
  const int=setInterval(()=>{
    el.innerText=i++;
    if(i>value) clearInterval(int);
  },20);
}
