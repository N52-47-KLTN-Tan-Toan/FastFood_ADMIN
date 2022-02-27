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

    var Toast = Swal.mixin({
        toast: true,
        position: 'top-end',
        showConfirmButton: false,
        timer: 3000
    });

    renderDataForLoaiMHOption();

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
                data: 'donGia',
                render: $.fn.dataTable.render.number( ',', '.', 0, '', ' VND' )
            }, {
                class: 'td_tenLMH',
                data: 'loaiMatHang.tenLMH'
            }, {
                class: 'text-center',
                data: 'maMH',
                render: function (data) {
                    return '<button id="edit" class="btn bg-gradient-warning"><i class="fas fa-marker"></i></button>' +
                        ' <button id="delete" class="btn bg-gradient-danger"><i class="fas fa-trash-alt"></i></button>';

                }
            }]
        });
    }

    //Hiển thị dữ liệu loại mặt hàng lên combobox
    function renderDataForLoaiMHOption(){
        $.ajax({
            type: "GET",
            contentType: "application/json",
            url: "http://localhost:8000/api/v1/loai-mat-hang",
            success: function (data) {
                $('#op-loaimh').append("<option value=''>Chọn loại mặt hàng</option>");
                $.each(data, (index, value) => {
                    $('<option>',
                        {
                            value: value.maLMH,
                            text: value.tenLMH
                        }).html(value.tenLMH).appendTo("#op-loaimh");
                });
            },
            error: function (data) {
                toastr.error('Lỗi tải dữ liệu. Vui lòng F5 vài giây sau!')
                console.log(data);
            }
        });
    }

    //Xóa mặt hàng theo id và xóa dòng liên quan trên bảng
    $('table').on('click', 'button[id="delete"]', function (e) {
        var id = $(this).closest('tr').children('td:first').text();
        var nameDel = $(this).closest('tr').children('td:nth-child(3)').text();

        deleteImageToStorageById(id);

        //Delete Object by id
        $.ajax({
            type: "DELETE",
            url: "http://localhost:8000/api/v1/mat-hang/" + id,
            success: function (data) {
                $('#example2').DataTable().ajax.reload(null, false);
                toastr.success(nameDel + ' đã xóa ra khỏi danh sách.');
            },
            error: function (err) {
                toastr.error('Đã có lỗi xảy ra. Xóa thất bại');
            }
        });
    })

    //Xóa hình ảnh trên firebase storage dựa trên tìm kiếm id của đối tượng
    function deleteImageToStorageById(id) {

        //Find Object by id
        $.ajax({
            type: 'GET',
            contentType: "application/json",
            url: 'http://localhost:8000/api/v1/mat-hang/' + id,
            success: function (data) {
                // Create a reference to the file to delete
                var desertRef = firebase.storage().refFromURL(data.hinhAnh);

                // Delete the file
                desertRef.delete().then(function () {
                    console.log("Delete file in firebase storage successfully");
                }).catch(function (error) {
                });
            },
            error: function (err) {
                console.log(err);
                alert("Error -> " + err);
            }
        });
    }

    //Tạo mới mặt hàng
    $("#add-product").submit(function (evt) {
        evt.preventDefault();

        const ref = firebase.storage().ref();
        const file = document.querySelector("#file").files[0];

        let name = "";
        try {
            name = +new Date() + "-" + file.name;
        }catch (e) {
            toastr.warning('Vui lòng chọn hình ảnh thích hợp!!!')
        }

        const metadata = {
            contentType: file.type
        };
        const task = ref.child(name).put(file, metadata);

        task
            .then(snapshot => snapshot.ref.getDownloadURL())
            .then(url => {
                $.ajax({
                    type: "POST",
                    url: "http://localhost:8000/api/v1/mat-hang",
                    data: JSON.stringify({
                        tenMH: $("#ten-mat-hang").val(),
                        moTa: $("#mo-ta-mat-hang").val(),
                        donGia: $("#don-gia-mat-hang").val(),
                        donViTinh: $("#don-vi-tinh").val(),
                        hinhAnh: url,
                        loaiMatHang: {
                            maLMH: $("#op-loaimh option:selected").val()
                        }
                    }),
                    contentType: "application/json",
                    success: function (data) {
                        $('#example2').DataTable().ajax.reload(null, false);
                        $('.modal').each(function(){
                            $(this).modal('hide');
                        });
                        toastr.success(data.tenMH + ' đã được thêm vào.')
                    },
                    error: function (err) {
                        toastr.error('Đã có lỗi xảy ra. Thêm thất bại!!!')
                    }
                });
            })
            .catch(console.error);
    });
});