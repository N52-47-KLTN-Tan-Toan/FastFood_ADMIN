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

    //Khai báo biến toast để hiển thị thông báo
    var Toast = Swal.mixin({
        toast: true,
        position: 'top-end',
        showConfirmButton: false,
        timer: 5000
    });

    $('#loading-event').hide();
    $('#loading-notification').hide();

    renderDataForLoaiMHOption();

    assignDataToTable();

    //Trả dữ liệu modal thêm mặt hàng về rỗng
    $(document).on('click', '#add-btn', function () {
        $("#ma-mat-hang").val(0);
        $("#ten-mat-hang").val('');
        $("#mo-ta-mat-hang").val('');
        $("#don-vi-tinh").val('');
        $("#photo").attr("src", "https://cdn-icons-png.flaticon.com/512/1040/1040241.png");
        $("#don-gia-mat-hang").val('');
        $("#op-loaimh").val('');
    })

    //Cập nhật, chỉnh sửa đối tượng
    $('table').on('click', 'button[id="edit"]', function (e) {

        //Lấy id từ bảng
        var maMH = $(this).closest('tr').children('td:first').text();

        //Tìm kiếm đối tượng theo id
        $.ajax({
            type: 'GET',
            contentType: "application/json",
            url: 'http://localhost:8000/api/v1/mat-hang/' + maMH,
            success: function (data) {
                //Set dữ liệu dưới modal
                $("#ma-mat-hang").val(maMH);
                $("#ten-mat-hang").val(data.tenMH);
                $("#mo-ta-mat-hang").val(data.moTa);
                $("#don-vi-tinh").val(data.donViTinh);
                $("#photo").attr("src", data.hinhAnh);
                $("#don-gia-mat-hang").val(data.donGia);
                $("#op-loaimh").val(data.loaiMatHang.maLMH);
            },
            error: function (err) {
                console.log(err);
                alert("Error -> " + err);
            }
        });
    })

    //Tạo mới mặt hàng
    $("#add-product").submit(function (evt) {
        evt.preventDefault();

        const ref = firebase.storage().ref();
        const file = document.querySelector("#file").files[0];
        var id = $("#ma-mat-hang").val();
        let name;
        let task;

        if (id == 0) {
            //convert hình ảnh upload
            try {
                name = +new Date() + "-" + file.name;
                const metadata = {
                    contentType: file.type
                };

                task = ref.child(name).put(file, metadata);

                //Thêm mới đối tượng
                $('#loading-event').show();
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
                                loadingModalAndRefreshTable();
                                toastr.success(data.tenMH + ' đã được thêm vào.')
                            },
                            error: function (err) {
                                toastr.error('Đã có lỗi xảy ra. Thêm thất bại!!!')
                            }
                        });
                    })
                    .catch(console.error);
            } catch (e) {
                toastr.warning('Vui lòng chọn hình ảnh thích hợp!!!')
                return false;
            }
        } else if (id > 0) {
            //Cập nhật thông tin đối tượng
            if ($('#file').val() == "") {
                //không có cập nhật ảnh
                const url = $('#img_' + id).prop('src');
                $('#loading-event').show();
                updateProduct(url);
            } else {
                //convert hình ảnh upload
                try {
                    name = +new Date() + "-" + file.name;

                    const metadata = {
                        contentType: file.type
                    };
                    task = ref.child(name).put(file, metadata);

                    //có cập nhật ảnh
                    $('#loading-event').show();
                    deleteImageToStorageById(id);
                    task
                        .then(snapshot => snapshot.ref.getDownloadURL())
                        .then(url => {
                            updateProduct(url);
                        })
                        .catch(console.error);
                } catch (e) {
                    toastr.warning('Vui lòng chọn hình ảnh thích hợp!!!')
                    return false;
                }
            }
        }

        function updateProduct(url) {
            $.ajax({
                type: "PUT",
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
                url: "http://localhost:8000/api/v1/mat-hang/" + id,
                success: function (data) {
                    loadingModalAndRefreshTable();
                    toastr.success('Mặt hàng ' + data.maMH + ' đã được chỉnh sửa.')
                },
                error: function (err) {
                    toastr.error('Đã có lỗi xảy ra. Cập nhật thất bại!!!')
                }
            });
        }

        function loadingModalAndRefreshTable() {
            $('#loading-event').hide();
            $('.modal').each(function () {
                $(this).modal('hide');
            });
            $('#example2').DataTable().ajax.reload(null, false);
        }
    });

    let id_del = 0;
    let name_del = "";

    //Hiển thị modal thông báo xóa mặt hàng
    $('table').on('click', 'button[id="delete"]', function (e) {
        id_del = $(this).closest('tr').children('td:first').text();
        name_del = $(this).closest('tr').children('td:nth-child(3)').text();

        $("#modal-overlay .modal-body").text("Xóa \"" + name_del.toUpperCase() + "\" ra khỏi danh sách?");
    })

    //Xóa mặt hàng theo id và xóa dòng liên quan trên bảng
    $(document).on("click", "#modal-accept-btn", function () {

        $('#loading-notification').show();

        deleteImageToStorageById(id_del);

        //Delete Object by id
        $.ajax({
            type: "DELETE",
            url: "http://localhost:8000/api/v1/mat-hang/" + id_del,
            success: function (data) {
                $('#loading-notification').hide();
                $('.modal').each(function () {
                    $(this).modal('hide');
                });
                $('#example2').DataTable().ajax.reload(null, false);
                toastr.success('\"' + name_del.toUpperCase() + '\" đã xóa ra khỏi danh sách.');
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
                    // console.log("Delete file in firebase storage successfully");
                }).catch(function (error) {
                });
            },
            error: function (err) {
                // console.log(err);
                alert("Error -> " + err);
            }
        });
    }

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
                render: $.fn.dataTable.render.number(',', '.', 0, '', ' VND')
            }, {
                class: 'td_tenLMH',
                data: 'loaiMatHang.tenLMH'
            }, {
                class: 'text-center',
                data: 'maMH',
                render: function (data) {
                    return '<button id="edit" class="btn bg-gradient-warning" ' +
                        'data-toggle="modal" data-target="#modal-xl"><i class="fas fa-marker"></i></button>' +
                        ' <button id="delete" class="btn bg-gradient-danger" ' +
                        'data-toggle="modal" data-target="#modal-overlay"><i class="fas fa-trash-alt"></i></button>';

                }
            }]
        });
    }

    //Hiển thị dữ liệu loại mặt hàng lên combobox
    function renderDataForLoaiMHOption() {
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

});