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
        $("#example2").DataTable({
            paging: true,
            lengthChange: false,
            searching: true,
            ordering: true,
            info: true,
            autoWidth: false,
            responsive: true,
            pageLength: 5,
            fnCreatedRow: function (nRow, aData, iDataIndex) {
                $(nRow).attr('id', 'tr_' + aData.maMH); // or whatever you choose to set as the id
            },
            ajax: {
                url: "http://localhost:8000/api/v1/mat-hang",
                type: "GET",
                contentType: "application/json",
                dataSrc: function (d) {
                    return d
                },
            },
            columns: [{
                class: 'text-center',
                data: 'maMH'
            }, {
                class: 'text-center',
                data: 'hinhAnh',
                render: function (data, type, row, meta) {
                    return '<img id="img_' + row.maMH + '" src="' + data + '" width="50" height="50" />';
                }
            }, {
                class: 'td_tenMH',
                data: 'tenMH'
            }, {
                class: 'td_moTa',
                data: 'moTa'
            }, {
                class: 'td_donViTinh',
                data: 'donViTinh'
            }, {
                class: 'td_donGia',
                data: 'donGia'
            }, {
                class: 'td_tenLMH',
                data: 'loaiMatHang.tenLMH'
            }, {
                class: 'text-center',
                data: 'maMH',
                render: function (data) {
                    return '<button id="edit" class="btn bg-gradient-warning"><i class="fas fa-edit mr-2"></i>Sửa</button>' +
                        ' <button id="delete" class="btn bg-gradient-danger"><i class="fas fa-trash-alt mr-2"></i>Xóa</button>';

                }
            }]
        });
    }

    //Xóa mặt hàng theo id và xóa dòng liên quan trên bảng
    $('table').on('click', 'button[id="delete"]', function (e) {
        var id = $(this).closest('tr').children('td:first').text();

        // deleteImageToStorageById(id);

        //Delete Object by id
        $.ajax({
            type: "DELETE",
            url: "http://localhost:8000/api/v1/mat-hang/" + id,
            success: function (data) {
                $('#example2').DataTable().ajax.reload();
                alert("Xóa thành công");
            },
            error: function (err) {
                console.log(err);
            }
        });
    })
});