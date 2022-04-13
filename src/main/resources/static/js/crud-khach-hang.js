// Initialize Firebase
firebase.initializeApp(firebaseConfig)

;(function () {

    // Method validation for datepicker
    $.validator.addMethod('dateFormat',
        function (value, element) {
            var check = false
            var re = /^\d{4}\-\d{1,2}\-\d{1,2}$/
            if (re.test(value)) {
                var adata = value.split('-')
                var dd = parseInt(adata[2], 10)
                var mm = parseInt(adata[1], 10)
                var yyyy = parseInt(adata[0], 10)
                var xdata = new Date(yyyy, mm - 1, dd)
                if ((xdata.getFullYear() === yyyy) && (xdata.getMonth() === mm - 1) && (xdata.getDate() === dd)) {
                    check = true
                } else {
                    check = false
                }
            } else {
                check = false
            }
            return this.optional(element) || check
        }, 'Sai định dạng (ngày / tháng / năm)')

    // Các ràng buộc cho field
    var rules = {
        tenKhachHang: {
            required: true,
            maxlength: 32
        },
        'rad-gender': {
            required: true,
        },
        ngaySinh: {
            required: true,
            dateFormat: true
        },
        sdt: {
            required: true,
            digits: true,
            pattern: /^(84|0[2|3|5|7|8|9])+([0-9]{8})$/,
            remote: {
                url: url_api_client + '/checkExistsByPhone',
                type: 'POST',
                data: {
                    p: function () {
                        return $("#sdt").val()
                    }
                }
            }
        },
        email: {
            required: true,
            email: true
        },
        diaChi: {
            required: true,
        }
    }

    // Các thông báo khi bắt lỗi
    var mess = {
        tenKhachHang: {
            required: 'Vui lòng điền tên khách hàng',
            maxlength: 'Tên khách hàng tối đa 32 ký tự'
        },
        'rad-gender': {
            required: 'Vui lòng chọn giới tính',
        },
        ngaySinh: {
            required: 'Vui lòng chọn ngày sinh',
        },
        sdt: {
            required: 'Vui lòng điền số điện thoại',
            digits: 'Chỉ được nhập số',
            pattern: 'Gồm 0(3|5|7|8|9) đầu và 8 số theo sau',
            remote: 'Số điện thoại này đã tồn tại'
        },
        email: {
            required: 'Vui lòng điền email',
            email: 'Sai định dạng email'
        },
        diaChi: {
            required: 'Vui lòng điền địa chỉ',
        }
    }

    $('#loading-event-khach-hang').hide()
    $('#loading-notification').hide()

    assignDataToTable()

    uploadFileExcel(url_api_client)

    //Trả dữ liệu modal thêm khách hàng về rỗng
    $(document).on('click', '.add-btn-client', function () {
        $("#ma-khach-hang").val(0)
        $("#ten-khach-hang").val('')
        $("#diem-tich-luy").val(0).prop('readonly', true)
        $("#ngay-sinh").val('')
        $("#sdt").val('')
        $("#image-upload-firebase").attr("src", "https://cdn-icons-png.flaticon.com/512/1040/1040241.png")
        $("#email").val('')
        $("#dia-chi").val('')
        $("#file-upload-firebase").val('')
    })

    //Lấy dữ liệu đối tượng từ nút edit
    $('table').on('click', '.edit-btn', function () {

        let btn_id = this.id.split("_")[2]

        //Find Object by id
        $.ajax({
            type: 'GET',
            contentType: "application/json",
            url: url_api_client + '/' + btn_id,
            success: function (data) {
                // $("#ma-khach-hang").val('********' + btn_id.substring(31, 36))
                $("#ma-khach-hang").val(btn_id)
                $("#ten-khach-hang").val(data.name)
                $("#diem-tich-luy").val(data.diemTichLuy).prop('readonly', false)
                $("#ngay-sinh").val(data.birthDate)
                $("#sdt").val(data.phone)
                $("#image-upload-firebase").attr("src", data.avatar)
                $("#email").val(data.email)
                $("#dia-chi").val(data.address)
                if (data.gender == true) {
                    $('#gender-male').prop("checked", true)
                } else {
                    $('#gender-female').prop("checked", true)
                }
            },
            error: function (err) {
                alert("Error -> " + err)
            }
        })
    })

    $.validator.setDefaults({
        submitHandler: function () {

            const ref = firebase.storage().ref()
            const file = document.querySelector("#file-upload-firebase").files[0]

            var id = $("#ma-khach-hang").val()
            var ext = $('#file-upload-firebase').val().split('.').pop().toLowerCase()

            let name

            if (id == 0) {

                if($.inArray(ext, ['gif','png','jpg','jpeg']) == -1) {
                    toastr.warning('Vui lòng chọn hình ảnh có đuôi .gif .png .jpg hoặc .jpeg !!!!')
                    return false
                }

                //convert hình ảnh upload
                try {
                    name = +new Date() + "-" + file.name
                } catch (e) {
                    toastr.warning('Vui lòng chọn hình ảnh!!!')
                    return false;
                }
                const metadata = {
                    contentType: file.type
                };

                const task = ref.child(name).put(file, metadata)

                //Thêm mới đối tượng
                $('#loading-event-khach-hang').show()
                task
                    .then(snapshot => snapshot.ref.getDownloadURL())
                    .then(url => {
                        $.ajax({
                            type: "POST",
                            url: url_api_client,
                            data: JSON.stringify({
                                name: $("#ten-khach-hang").val(),
                                birthDate: $("#ngay-sinh").val(),
                                phone: $("#sdt").val(),
                                email: $("#email").val(),
                                address: $("#dia-chi").val(),
                                gender: $(".rad-gender:checked").val() == 1 ? true : false,
                                avatar: url,
                                roleName: 'ROLE_CLIENT',
                                password: '1234',
                                diemTichLuy: 0
                            }),

                            contentType: "application/json",
                            success: function (data) {
                                loadingModalAndRefreshTable($('#loading-event-khach-hang'), $('#example2'))
                                toastr.success('Khách hàng ' + data.name + ' đã được thêm vào.')
                            },
                            error: function (err) {
                                loadingModalAndRefreshTable($('#loading-event-khach-hang'), $('#example2'))
                                toastr.error('Quá nhiều yêu cầu. Vui lòng thử lại sau')
                            }
                        })
                    })
                    .catch(console.error)

            } else {
                //Cập nhật thông tin đối tượng có hoặc không cập nhật ảnh trên firebase
                if ($('#file-upload-firebase').val() == '') {

                    //Không có cập nhật ảnh
                    const url = $('#img_' + id).prop('src')
                    $('#loading-event-khach-hang').show()
                    updateCustomer(url)

                } else {

                    if($.inArray(ext, ['gif','png','jpg','jpeg']) == -1) {
                        toastr.warning('Vui lòng chọn hình ảnh có đuôi .gif .png .jpg hoặc .jpeg !!!!')
                        return false
                    }

                    //convert hình ảnh upload
                    try {
                        name = +new Date() + "-" + file.name
                    } catch (e) {
                        toastr.warning('Vui lòng chọn hình ảnh thích hợp!!!')
                        return false
                    }
                    const metadata = {
                        contentType: file.type
                    };
                    const task = ref.child(name).put(file, metadata)

                    //Có cập nhật ảnh
                    $('#loading-event-khach-hang').show()
                    deleteImageToStorageByIdForPerson(id, url_api_client)
                    task
                        .then(snapshot => snapshot.ref.getDownloadURL())
                        .then(url => {
                            updateCustomer(url)
                        })
                        .catch(console.error)
                }
            }

            //Hàm cập nhật khách hàng
            function updateCustomer(url) {
                $.ajax({
                    type: 'GET',
                    contentType: "application/json",
                    url: url_api_client + '/' + id,
                    success: function (data) {
                        $.ajax({
                            type: "PUT",
                            data: JSON.stringify({
                                name: $("#ten-khach-hang").val(),
                                birthDate: $("#ngay-sinh").val(),
                                phone: $("#sdt").val(),
                                email: $("#email").val(),
                                address: $("#dia-chi").val(),
                                gender: $(".rad-gender:checked").val() == 1 ? true : false,
                                avatar: url,
                                roleName: data.roleName,
                                password: data.password,
                                diemTichLuy: $("#diem-tich-luy").val()
                            }),
                            contentType: "application/json",
                            url: url_api_client + '/' + id,
                            success: function (data) {
                                loadingModalAndRefreshTable($('#loading-event-khach-hang'), $('#example2'))
                                toastr.success('Thông tin của khách hàng ' + data.name + ' đã được chỉnh sửa.')
                            },
                            error: function (err) {
                                loadingModalAndRefreshTable($('#loading-event-khach-hang'), $('#example2'))
                                toastr.error('Quá nhiều yêu cầu. Vui lòng thử lại sau')
                            }
                        });
                    },
                    error: function (err) {
                        alert("Error -> " + err)
                    }
                })
            }
        }
    })
    validateForm($('#create-update-khach-hang'), rules, mess)

    //Hiển thị modal thông báo xóa khách hàng
    $('table').on('click', '.delete-btn', function () {

        let btn_id = this.id.split("_")[2]

        $.ajax({
            type: 'GET',
            contentType: "application/json",
            url: url_api_client + '/' + btn_id,
            success: function (data) {
                $("#modal-overlay .modal-body").text("Xóa khách hàng \"" + data.name + "\" ra khỏi danh sách?")
            },
            error: function (err) {
                alert("Error -> " + err)
            }
        })

        //Xóa khách hàng theo id
        $('#modal-accept-btn').click(function () {
            $('#loading-event-khach-hang').show()

            deleteImageToStorageByIdForPerson(btn_id, url_api_client)

            //Delete Object by id
            $.ajax({
                type: "DELETE",
                url: url_api_client + '/' + btn_id,
                success: function (data) {
                    loadingModalAndRefreshTable($('#loading-event-khach-hang'), $('#example2'))
                    toastr.success('Khách hàng \"' + btn_id + '\" đã xóa ra khỏi danh sách.')
                },
                error: function (err) {
                    loadingModalAndRefreshTable($('#loading-event-khach-hang'), $('#example2'))
                    toastr.error('Quá nhiều yêu cầu. Vui lòng thử lại sau')
                }
            })
        })
    })

    //Hiển thị dữ liệu
    function assignDataToTable() {
        var t = $("#example2").DataTable({
            paging: true,
            pagingType: 'full_numbers',
            lengthChange: true,
            searching: true,
            ordering: true,
            info: true,
            autoWidth: false,
            responsive: true,
            processing: true,
            lengthMenu: [[5, 10, 20, -1], [5, 10, 20, 'Tất cả']],
            //Thay đổi ngôn ngữ của bảng
            oLanguage: {
                sLengthMenu: 'Hiển thị _MENU_ khách hàng',
                sSearch: 'Tìm kiếm',
                sInfo: 'Đang hiển thị từ _START_ đến _END_ trên _TOTAL_ khách hàng.',
                sEmptyTable: 'Không có dữ liệu để hiển thị',
                sProcessing: "Đang tải dữ liệu...",
                oPaginate: {
                    sFirst: 'Đầu',
                    sLast: 'Cuối',
                    sNext: '>',
                    sPrevious: '<'
                },
            },

            //Tạo id cho mỗi thẻ tr
            fnCreatedRow: function (nRow, aData, iDataIndex) {
                $(nRow).attr('id', 'tr_' + aData.userId) // or whatever you choose to set as the id
            },
            ajax: {
                url: url_api_client,
                type: "GET",
                contentType: "application/json",
                dataSrc: function (d) {
                    return d
                },
            },

            columns: [{
                class: 'text-center',
                data: 'userId'
            }, {
                class: 'text-center',
                data: 'avatar',
                render: function (data, type, row, meta) {
                    return '<img id="img_' + row.userId + '" src="' + data + '" width="50" height="50" />'
                },
                searchable: false, orderable: false, visible: true
            }, {
                class: 'td_name',
                data: 'name'
            }, {
                class: 'td_diemTichLuy',
                data: 'diemTichLuy'
            }, {
                class: 'td_address',
                data: 'address'
            }, {
                class: 'td_gender',
                data: 'gender',
                render: function (data) {
                    return data ? 'Nam' : 'Nữ'
                }
            }, {
                class: 'td_email',
                data: 'email'
            }, {
                class: 'td_birthDate',
                data: 'birthDate',
                render: $.fn.dataTable.render.moment('YYYY-MM-DD', 'DD/MM/YYYY')
            }, {
                class: 'td_phone',
                data: 'phone',
            }, {
                class: 'text-center',
                data: 'userId',
                render: function (data, type, row, meta) {
                    return '<button id="create_order_' + row.userId + '" class="btn bg-gradient-primary createOrderBtn" ' +
                        '><i class="fas fa-cart-plus"></i></button>'
                },
                searchable: false, orderable: false, visible: true
            }, {
                class: 'text-center',
                data: 'userId',
                render: function (data, type, row, meta) {
                    return '<button id="btn_edit_' + row.userId + '" class="btn bg-gradient-warning edit-btn" ' +
                        'data-toggle="modal" data-target="#modal-xl"><i class="fas fa-marker"></i></button>'
                },
                searchable: false, orderable: false, visible: true
            }, {
                class: 'text-center',
                data: 'userId',
                render: function (data, type, row, meta) {
                    if ($('#role_name').val() == 'ROLE_ADMIN') {
                        return '  <button id="btn_delete_' + row.userId + '" class="btn bg-gradient-danger delete-btn" ' +
                            'data-toggle="modal" data-target="#modal-overlay"><i class="fas fa-trash-alt"></i></button>'
                    } else {
                        return '  <button class="btn bg-gradient-danger disabled">' +
                            '<i class="fas fa-trash-alt"></i>' +
                            '</button>'
                    }
                },
                searchable: false, orderable: false, visible: true
            }]
        })

        //Tạo số thứ tự bắt đầu từ 1 vào cột mã
        t.on('order.dt search.dt', function () {
            t.column(0, {search: 'applied', order: 'applied'}).nodes().each(function (cell, i) {
                cell.innerHTML = i + 1
            })
        }).draw()

        var typeColumn = {
            exportOptions: {
                format: {
                    body: function (data, row, column, node) {
                        // Strip $ from salary column to make it numeric
                        return column === 1 ? data.split('"')[3] : data
                        && column === 7 ? data.split('/')[2] + '-' + data.split('/')[1] + '-' + data.split('/')[0] : data
                    },
                }
            }
        }

        new $.fn.dataTable.Buttons(t, {
            buttons: [
                {
                    className: 'mb-2 mr-1',
                    text: '<i class="fas fa-sync"></i>',
                    action: function (e, dt, node, conf) {
                        t.ajax.reload(null, false)
                    }
                },
                {
                    className: 'mr-1 mb-2 btn bg-gradient-info add-btn-client',
                    text: '<i class="fas fa-plus"></i>&nbsp;&nbsp;&nbsp;Thêm',
                    action: function (e, dt, node, config) {
                        $('#modal-xl ').modal('show')
                    }
                },
                {
                    className: 'mr-1 mb-2 bg-gradient-success',
                    text: '<i class="fas fa-upload"></i>&nbsp;&nbsp;&nbsp;Tải lên',
                    action: function (e, dt, node, config) {
                        $('#modal-success').modal('show')
                    }
                },
                $.extend(true, {}, typeColumn, {
                    title: 'T&T_FastFood_Shop_KhachHang',
                    className: 'mr-1 mb-2 btn bg-gradient-success',
                    extend: 'excelHtml5',
                    text: '<i class="fas fa-file-excel"></i>&nbsp;&nbsp;&nbsp;Xuất Excel',
                    autoFilter: true,
                    sheetName: 'KhachHang',
                    exportOptions: {
                        columns: [0, 1, 2, 3, 4, 5, 6, 7, 8]
                    }
                }),
                {
                    className: 'mb-2 btn bg-gradient-primary',
                    extend: 'colvis',
                    text: 'Hiển thị cột',
                }
            ]
        })

        t.buttons(0, null).container().prependTo(
            t.table().container()
        )
    }

    $('table').on('click', '.createOrderBtn', function () {

        let btn_id = this.id.split("_")[2]

        $.ajax({
            type: "POST",
            url: url_api_order,
            data: JSON.stringify({
                khachHang: {
                    userId: btn_id
                }
            }),

            contentType: "application/json",
            success: function (res) {
                window.location.href = '/createOrder/customer/' + btn_id + '/order/' + res.maDDH
            },
            error: function (err) {
                loadingModalAndRefreshTable($('#loading-event-khach-hang'), $('#example2'))
                toastr.error('Quá nhiều yêu cầu. Vui lòng thử lại sau')
            }
        })
    })
}())