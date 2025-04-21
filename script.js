// 格式化日期
function formatDate(value) {
    const date = new Date(value);
    if (isNaN(date)) return value; // 若無法解析就直接返回原值

    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, "0");
    const day = String(date.getDate()).padStart(2, "0");

    return `${year}-${month}-${day}`;
}

// API 網址（這個 URL 需要更新為你的實際 API）
const apiUrl = "https://script.google.com/macros/s/AKfycbzdUXs7czaDkNaZRMnD2A0qCUEJZIFYpKhwjYDcn-0RdFNlVtHglia-OumZf9iHoYh8/exec";

const form = document.getElementById("recordForm");
const recordsContainer = document.getElementById("records");
const totalContainer = document.querySelector(".total");

// 讀取並顯示紀錄，並根據月份篩選
async function loadRecords() {
    try {
        const response = await fetch(apiUrl);
        const data = await response.json();

        // 取得選擇的月份
        const selectedMonth = document.getElementById("month").value;

        let totalAmount = 0;  // 用來統計總金額
        recordsContainer.innerHTML = "";

        for (let i = 1; i < data.length; i++) { // 略過標題列
            let [rawDate, category, amount, note] = data[i];
            let date = formatDate(rawDate);

            // 篩選出指定月份的紀錄
            const recordMonth = date.split("-")[1];  // 取出月份部分
            if (recordMonth === selectedMonth) {
                totalAmount += amount;  // 累加該月支出

                const recordElement = document.createElement("div");
                recordElement.classList.add("record");
                recordElement.innerHTML = 
                    `<p><strong>日期：</strong>${date}</p>
                     <p><strong>類別：</strong>${category}</p>
                     <p><strong>金額：</strong>${amount}</p>
                     <p><strong>備註：</strong>${note}</p>`;
                recordsContainer.appendChild(recordElement);
            }
        }

        // 顯示該月總支出
        totalContainer.innerHTML = `<p><strong>總支出：</strong>${totalAmount} 元</p>`;

    } catch (error) {
        console.error("讀取紀錄時發生錯誤：", error);
        recordsContainer.innerHTML = "<p style='color: red;'>載入失敗，請稍後再試</p>";
    }
}

// 新增資料
form.addEventListener("submit", async function (event) {
    event.preventDefault();

    const rawDate = document.getElementById("date").value;
    const date = formatDate(rawDate); // 格式化日期

    const category = document.getElementById("category").value;
    const amount = Number(document.getElementById("amount").value);
    const note = document.getElementById("note").value;

    const newRecord = { date, category, amount, note };

    try {
        await fetch(apiUrl, {
            method: "POST",
            body: JSON.stringify(newRecord),
            headers: { "Content-Type": "application/json" },
            mode: "no-cors"  // 注意：無法獲得回應，但仍可送出資料
        });

        form.reset();
        alert("記帳成功！（請到 Google Sheets 查看資料）");

        setTimeout(loadRecords, 2000); // 延遲載入資料以等待 Sheets 更新
    } catch (error) {
        console.error("新增記錄時發生錯誤：", error);
        alert("新增失敗，請稍後再試！");
    }
});

// 監聽月份選擇器變化
document.getElementById("month").addEventListener("change", loadRecords);

// 頁面載入時顯示資料
window.addEventListener("load", loadRecords);
