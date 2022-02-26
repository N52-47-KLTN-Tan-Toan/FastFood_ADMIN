var firebaseConfig = {
    apiKey: "AIzaSyBSLLi7jGwomqntt2Ky0RnmIdk_wM0YGL0",
    authDomain: "n52-47-kltn-tan-toan.firebaseapp.com",
    projectId: "n52-47-kltn-tan-toan",
    storageBucket: "n52-47-kltn-tan-toan.appspot.com",
    messagingSenderId: "601210556956",
    appId: "1:601210556956:web:dc4df16ecb002d447085d9",
    measurementId: "G-J68P4KMT72"
};

// Initialize Firebase
firebase.initializeApp(firebaseConfig);

$(document).ready(function () {
    assignDataToTable();
//Hiển thị dữ liệu
    function assignDataToTable() {
        // $('#example1 tbody').empty();
        var table = $("#example1 tbody");
        $.ajax({
            type: "GET",
            contentType: "application/json",
            url: "http://localhost:8000/api/v1/mat-hang",
            success: function (data) {
                table.empty();
                $.each(data, function (i, mhs) {
                    let img_id = "img_" + mhs.maMH;
                    // let tr_id = "tr_" + mhs.maMH;
                    // table.append("<tr id='" + tr_id + "'> \
                    //         <td><img  width='50' height='50' id='" + img_id + "' src='" + mhs.hinhAnh + "' /></td> \
                    //         <td>" + mhs.maMH + "</td> \
                    //         <td class='td_tmh'>" + mhs.tenMH + "</td> \
                    //         <td class='td_mota'>" + mhs.moTa + "</td> \
                    //         <td class='td_donvitinh'>" + mhs.donViTinh + "</td> \
                    //         <td class='td_dongia'>" + mhs.donGia + "</td> \
                    //         <td class='td_loaimathang'>" + mhs.loaiMatHang.tenLMH + "</td> \
                    //         <td class='td_action'>\
                    //         <button id='edit' class='btn btn-lg bg-gradient-warning'><i class=\"fas fa-edit mr-2\"></i>Sửa</button> \
                    //        <button id='delete' class='btn btn-lg bg-gradient-danger'><i class=\"fas fa-trash-alt mr-2\"></i>Xóa</button>\
                    //        </td> \
                    //     </tr>");
                    table.append(
                        "<tr><td><img  width='50' height='50' id='" + img_id + "' src='" + mhs.hinhAnh + "' /></td> \
                        <td> " + mhs.maMH +" </td> \
                        <td> " + mhs.tenMH +" </td> \
                        <td> " + mhs.moTa +" </td> \
                        <td> " + mhs.donViTinh +" </td> \
                        <td> " + mhs.donGia +" </td> \
                        <td> " + mhs.loaiMatHang.tenLMH +" </td> \
                        <td><button id='edit' class='btn btn-lg bg-gradient-warning'><i class='fas fa-edit mr-2'></i>Sửa</button> \
                        <button id='delete' class='btn btn-lg bg-gradient-danger'><i class='fas fa-trash-alt mr-2'></i>Xóa</button> </td><tr>")
                });
                $("#example1").DataTable();
            },
            error: function (data) {
                console.log(data);
            }
        });
    }
});