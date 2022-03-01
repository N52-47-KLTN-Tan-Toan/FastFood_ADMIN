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
        $("#image-upload-firebase").attr("src", "https://cdn-icons-png.flaticon.com/512/1040/1040241.png");
        $("#don-gia-mat-hang").val('');
        $("#op-loaimh").val('');
        $("#file-upload-firebase").val('');
    })

    let id_edit = 0;
    //Lấy dữ liệu đối tượng từ nút edit
    $('table').on('click', '.edit-btn', function (e) {

        let btn_id = this.id;
        id_edit = btn_id.split("_")[2];

        //Find Object by id
        $.ajax({
            type: 'GET',
            contentType: "application/json",
            url: 'http://localhost:8000/api/v1/mat-hang/' + id_edit,
            success: function (data) {
                $("#ma-mat-hang").val(id_edit);
                $("#ten-mat-hang").val(data.tenMH);
                $("#mo-ta-mat-hang").val(data.moTa);
                $("#don-vi-tinh").val(data.donViTinh);
                $("#image-upload-firebase").attr("src", data.hinhAnh);
                $("#don-gia-mat-hang").val(data.donGia);
                $("#op-loaimh").val(data.loaiMatHang.maLMH);
            },
            error: function (err) {
                alert("Error -> " + err);
            }
        });
    })

    //Tạo mới mặt hàng
    $("#add-product").submit(function (evt) {
        evt.preventDefault();

        const ref = firebase.storage().ref();
        const file = document.querySelector("#file-upload-firebase").files[0];
        var id = $("#ma-mat-hang").val();
        let name;
        let task;

        if (id == 0) {
            //convert hình ảnh upload
            try {
                name = +new Date() + "-" + file.name;
            } catch (e) {
                toastr.warning('Vui lòng chọn hình ảnh thích hợp!!!')
                return false;
            }
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
        } else if (id > 0) {
            //Cập nhật thông tin đối tượng
            if ($('#file-upload-firebase').val() == "") {
                //không có cập nhật ảnh
                const url = $('#img_' + id).prop('src');
                $('#loading-event').show();
                updateProduct(url);
            } else {
                //convert hình ảnh upload
                try {
                    name = +new Date() + "-" + file.name;
                } catch (e) {
                    toastr.warning('Vui lòng chọn hình ảnh thích hợp!!!')
                    return false;
                }
                const metadata = {
                    contentType: file.type
                };
                const task = ref.child(name).put(file, metadata);

                //có cập nhật ảnh
                $('#loading-event').show();
                deleteImageToStorageById(id);
                task
                    .then(snapshot => snapshot.ref.getDownloadURL())
                    .then(url => {
                        updateProduct(url);
                    })
                    .catch(console.error);
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
                    $('#loading-event').hide();
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

    //Hiển thị modal thông báo xóa mặt hàng
    $('table').on('click', '.delete-btn', function() {
        let btn_id = this.id;
        id_del = btn_id.split("_")[2];

        $("#modal-overlay .modal-body").text("Xóa mặt hàng \"" + id_del + "\" ra khỏi danh sách?");
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
                toastr.success('Mặt hàng \"' + id_del + '\" đã xóa ra khỏi danh sách.');
            },
            error: function (err) {
                $('#loading-event').hide();
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
            lengthChange: true,
            searching: true,
            ordering: true,
            info: true,
            autoWidth: false,
            responsive: true,
            // fixedHeader: true,
            // scrollX: 200,
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
            lengthMenu: [
                [10, 25, 50, 100, -1],
                [10, 25, 50, 100, "All"]
            ],
            initComplete: function() {
                var column = this.api().column(6);

                var select = $('#select-lmh')
                    .on('change', function() {
                        var val = $(this).val();
                        column.search(val ? '^' + $(this).val() + '$' : val, true, false).draw();
                    });

                column.data().unique().sort().each(function(d, j) {
                    select.append('<option value="' + d + '">' + d + '</option>');
                });
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
                data: 'loaiMatHang.tenLMH',
                render: function (data, type, row, meta) {
                    return '<span id="' + row.loaiMatHang.maLMH + '">' + row.loaiMatHang.tenLMH + '</span>';
                }
            }, {
                class: 'text-center',
                data: 'maMH',
                render: function (data, type, row, meta) {
                    return '<button id="btn_edit_' + row.maMH + '" class="btn bg-gradient-warning edit-btn" ' +
                        'data-toggle="modal" data-target="#modal-xl"><i class="fas fa-marker"></i></button>' +
                        ' <button id="btn_delete_' + row.maMH + '" class="btn bg-gradient-danger delete-btn" ' +
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