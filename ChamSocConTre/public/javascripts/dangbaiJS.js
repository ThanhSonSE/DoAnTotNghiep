var itemND = document.getElementById('noiDung');

function addItem() {
    var table = document.createElement("table");
    table.className = "table-phan";

    var trTDPhan = document.createElement("tr");
    var tdTDPhan = document.createElement("td");
    tdTDPhan.innerText = "Tiêu đề phần :";
    trTDPhan.appendChild(tdTDPhan);
    table.appendChild(trTDPhan);

    itemND.appendChild(table);
}