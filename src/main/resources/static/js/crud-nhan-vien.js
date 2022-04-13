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

    // Method validation for check username
    $.validator.addMethod('checkUsername',
        function (val, ele) {
            $.ajax({
                type: 'GET',
                contentType: "application/json",
                url: url_api_staff + '/username=' + val,
                success: function (res) {

                    if (val == res.username) {
                        return false
                    } else {
                        return true
                    }
                },
                error: function (err) {
                    alert("Error -> " + err)
                }
            })
        }, 'Tên đăng nhập đã tồn tại')

    // Các ràng buộc cho field
    var rules = {
        tenNhanVien: {
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
            pattern: /^(84|0[2|3|5|7|8|9])+([0-9]{8})$/
        },
        email: {
            required: true,
            email: true
        },
        diaChi: {
            required: true,
        },
        loaiNV: {
            required: true
        },
        tenDangNhap: {
            required: true,
            pattern: /^[a-z0-9_-]{5,15}$/,
            remote: {
                url: url_api_staff + '/checkExistsByUsername',
                type: 'POST',
                data: {
                    u: function () {
                        return $("#ten-dang-nhap").val()
                    }
                }
            }
        }
    }

    // Các thông báo khi bắt lỗi
    var mess = {
        tenNhanVien: {
            required: 'Vui lòng điền tên nhân viên',
            maxlength: 'Tên khách hàng tối đa 30 ký tự'
        },
        'rad-gender': {
            required: 'Vui lòng chọn giới tính',
        },
        ngaySinh: {
            required: 'Vui lòng chọn ngày sinh'
        },
        sdt: {
            required: 'Vui lòng điền số điện thoại',
            digits: 'Chỉ được nhập số',
            pattern: 'Gồm 0(3|5|7|8|9) đầu và 8 số theo sau'
        },
        email: {
            required: 'Vui lòng điền email',
            email: 'Sai định dạng email'
        },
        diaChi: {
            required: 'Vui lòng điền địa chỉ',
        },
        loaiNV: {
            required: 'Vui lòng chọn loại nhân viên'
        },
        tenDangNhap: {
            required: 'Vui lòng điền tên đăng nhập',
            pattern: 'Tên đăng nhập từ 5 đến 15 ký tự, bao gồm cả chữ và số',
            remote: 'Tên đăng nhập đã tồn tại'
        }
    }

    $('#loading-event-nhan-vien').hide()
    $('#loading-notification').hide()

    assignDataToTable()

    uploadFileExcel(url_api_staff)

    //Trả dữ liệu modal thêm nhân viên về rỗng
    $(document).on('click', '.add-btn-staff', function () {
        $("#ma-nhan-vien").val(0)
        $("#ten-nhan-vien").val('')
        $("#op-loainv").val('ROLE_STAFF_SALES')
        $("#ngay-sinh").val('')
        $("#sdt").val('')
        $("#image-upload-firebase").attr("src", "https://cdn-icons-png.flaticon.com/512/1040/1040241.png")
        $("#email").val('')
        $("#dia-chi").val('')
        $("#file-upload-firebase").val('')
        $('#ten-dang-nhap').val('')
        $('#ten-dang-nhap').prop('readonly', false)
    })

    //Lấy dữ liệu đối tượng từ nút edit
    $('table').on('click', '.edit-btn', function (e) {

        let btn_id = this.id.split("_")[2]

        //Find Object by id
        $.ajax({
            type: 'GET',
            contentType: "application/json",
            url: url_api_staff + '/' + btn_id,
            success: function (data) {
                $("#ma-nhan-vien").val(data.userId)
                $("#ten-nhan-vien").val(data.name)
                $("#op-loainv").val(data.roleName)
                $("#ngay-sinh").val(data.birthDate)
                $("#sdt").val(data.phone)
                $("#image-upload-firebase").attr('src', data.avatar)
                $("#email").val(data.email)
                $("#dia-chi").val(data.address)
                $('#ten-dang-nhap').val('hidden404' + data.username.substring(3, 5))
                $('#ten-dang-nhap').prop('readonly', true)
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

            var id = $("#ma-nhan-vien").val()
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
                    return false
                }
                const metadata = {
                    contentType: file.type
                }

                const task = ref.child(name).put(file, metadata)

                //Thêm mới đối tượng
                $('#loading-event-nhan-vien').show()
                task
                    .then(snapshot => snapshot.ref.getDownloadURL())
                    .then(url => {
                        $.ajax({
                            type: "POST",
                            url: url_api_staff,
                            data: JSON.stringify({
                                name: $("#ten-nhan-vien").val(),
                                birthDate: $("#ngay-sinh").val(),
                                phone: $("#sdt").val(),
                                email: $("#email").val(),
                                address: $("#dia-chi").val(),
                                gender: $(".rad-gender:checked").val() == 1 ? true : false,
                                avatar: url,
                                roleName: $("#op-loainv option:selected").val(),
                                password: '$2a$10$lUNmzJdFvspwLlEGhdKIZuLyrHXEtC94TK.dqhXD5XDex/rBmD4Qq',
                                username: $('#ten-dang-nhap').val()
                            }),

                            contentType: "application/json",
                            success: function (data) {
                                loadingModalAndRefreshTable($('#loading-event-nhan-vien'), $('#example2'))
                                toastr.success('Nhân viên ' + data.name + ' đã được thêm vào.')
                            },
                            error: function (err) {
                                loadingModalAndRefreshTable($('#loading-event-nhan-vien'), $('#example2'))
                                toastr.error('Quá nhiều yêu cầu. Vui lòng thử lại sau')
                            }
                        })
                    })
                    .catch(console.error)

            } else {

                //Cập nhật thông tin đối tượng có hoặc không cập nhật ảnh trên firebase
                if ($('#file-upload-firebase').val() == "") {

                    //Không có cập nhật ảnh
                    const url = $('#img_' + id).prop('src')
                    $('#loading-event-nhan-vien').show()
                    updateNhanVien(url)

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
                    $('#loading-event-nhan-vien').show()
                    deleteImageToStorageByIdForPerson(id, url_api_staff)
                    task
                        .then(snapshot => snapshot.ref.getDownloadURL())
                        .then(url => {
                            updateNhanVien(url)
                        })
                        .catch(console.error)

                }

            }

            //Hàm cập nhật nhân viên
            function updateNhanVien(url) {
                $.ajax({
                    type: 'GET',
                    contentType: "application/json",
                    url: url_api_staff + '/' + id,
                    success: function (data) {
                        $.ajax({
                            type: "PUT",
                            data: JSON.stringify({
                                name: $("#ten-nhan-vien").val(),
                                birthDate: $("#ngay-sinh").val(),
                                phone: $("#sdt").val(),
                                email: $("#email").val(),
                                address: $("#dia-chi").val(),
                                gender: $(".rad-gender:checked").val() == 1 ? true : false,
                                avatar: url,
                                roleName: $("#op-loainv").val(),
                                password: data.password,
                                username: data.username
                            }),
                            contentType: "application/json",
                            url: url_api_staff + '/' + id,
                            success: function (data) {
                                loadingModalAndRefreshTable($('#loading-event-nhan-vien'), $('#example2'))
                                toastr.success('Thông tin nhân viên "' + data.name + '" đã được chỉnh sửa.')
                            },
                            error: function (err) {
                                loadingModalAndRefreshTable($('#loading-event-nhan-vien'), $('#example2'))
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
    validateForm($('#create-update-nhan-vien'), rules, mess)

    //Hiển thị modal thông báo xóa nhân viên
    $('table').on('click', '.delete-btn', function () {

        let btn_id = this.id.split("_")[2]

        $.ajax({
            type: 'GET',
            contentType: "application/json",
            url: url_api_staff + '/' + btn_id,
            success: function (data) {
                $("#modal-overlay .modal-body").text("Xóa nhân viên \"" + data.name + "\" ra khỏi danh sách?")
            },
            error: function (err) {
                alert("Error -> " + err)
            }
        })

        //Xóa nhân viên theo id
        $('#modal-accept-btn').click(function () {

            $('#loading-event-nhan-vien').show()

            deleteImageToStorageByIdForPerson(btn_id, url_api_staff)

            //Delete Object by id
            $.ajax({
                type: "DELETE",
                url: url_api_staff + '/' + btn_id,
                success: function (data) {
                    loadingModalAndRefreshTable($('#loading-event-nhan-vien'), $('#example2'))
                    toastr.success('Nhân viên \"' + btn_id + '\" đã xóa ra khỏi danh sách.')
                },
                error: function (err) {
                    loadingModalAndRefreshTable($('#loading-event-nhan-vien'), $('#example2'))
                    toastr.error('Quá nhiều yêu cầu. Vui lòng thử lại sau')
                }
            })
        })
    })

    //Phân quyền
    $('table').on('change', '.phan-quyen', function () {

        let btn_id = this.id.split("_")[2]
        $.ajax({
            type: 'GET',
            contentType: "application/json",
            url: url_api_staff + '/' + btn_id,
            success: function (data) {
                $.ajax({
                    type: "PUT",
                    data: JSON.stringify({
                        name: data.name,
                        birthDate: data.birthDate,
                        phone: data.phone,
                        email: data.email,
                        address: data.address,
                        gender: data.gender,
                        avatar: data.avatar,
                        roleName: $('#phan_quyen_' + btn_id).val(),
                        password: data.password,
                        username: data.username
                    }),
                    contentType: "application/json",
                    url: url_api_staff + '/' + btn_id,
                    success: function (data) {
                        loadingModalAndRefreshTable($('#loading-event-nhan-vien'), $('#example2'))
                        toastr.success('Quyền cũa nhân viên ' + data.name + ' đã được thay đổi.')
                    },
                    error: function (err) {
                        loadingModalAndRefreshTable($('#loading-event-nhan-vien'), $('#example2'))
                        toastr.error('Quá nhiều yêu cầu. Vui lòng thử lại sau')
                    }
                })
            },
            error: function (err) {
                alert("Error -> " + err)
            }
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
                sLengthMenu: 'Hiển thị _MENU_ nhân viên',
                sSearch: 'Tìm kiếm',
                sInfo: 'Đang hiển thị từ _START_ đến _END_ trên _TOTAL_ nhân viên.',
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
                $(nRow).attr('id', 'tr_' + aData.userId); // or whatever you choose to set as the id
            },
            ajax: {
                url: url_api_staff,
                type: "GET",
                contentType: "application/json",
                dataSrc: function (d) {
                    return d
                },
            },

            columns: [{
                class: 'text-center',
                data: 'userId',
            }, {
                class: 'text-center',
                data: 'avatar',
                render: function (data, type, row, meta) {
                    return '<img id="img_' + row.userId + '" src="' + data + '" width="50" height="50" />';
                },
                searchable: false, orderable: false, visible: true
            }, {
                class: 'td_name',
                data: 'name'
            }, {
                class: 'td_tenLNV',
                data: 'roleName',
                render: function (data, type, row, meta) {
                    switch (row.roleName) {
                        case 'ROLE_ADMIN':
                            return ' <select disabled name="" id="phan_quyen_' + row.userId + '" class="form-control phan-quyen"> \
                        <option value="ROLE_ADMIN" selected>Người quản trị</option> \
                        <option value="ROLE_STAFF_SALES">Nhân viên bán hàng</option> \
                        <option value="ROLE_STAFF_WAREHOUSE">Nhân viên kho</option> \
                </select> '
                            break

                        case 'ROLE_STAFF_SALES':
                            return ' <select name="" id="phan_quyen_' + row.userId + '" class="form-control phan-quyen"> \
                        <option value="ROLE_ADMIN">Người quản trị</option> \
                        <option value="ROLE_STAFF_SALES" selected>Nhân viên bán hàng</option> \
                        <option value="ROLE_STAFF_WAREHOUSE">Nhân viên kho</option> \
                </select> '
                            break

                        case 'ROLE_STAFF_WAREHOUSE':
                            return ' <select name="" id="phan_quyen_' + row.userId + '" class="form-control phan-quyen"> \
                        <option value="ROLE_ADMIN">Người quản trị</option> \
                        <option value="ROLE_STAFF_SALES">Nhân viên bán hàng</option> \
                        <option value="ROLE_STAFF_WAREHOUSE" selected>Nhân viên kho</option> \
                </select> '
                            break
                    }
                },
                searchable: false, orderable: false, visible: true
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
                cell.innerHTML = i + 1;
            });
        }).draw()

        var typeColumn = {
            exportOptions: {
                format: {
                    body: function (data, row, column, node) {
                        // Strip $ from salary column to make it numeric
                        return column === 1 ? data.split('"')[3] : data
                        && column === 3 ? data.split('"')[7] : data
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
                    className: 'mr-1 mb-2 btn bg-gradient-info add-btn-staff',
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
                    title: 'T&T_FastFood_Shop_NhanVien',
                    className: 'mr-1 mb-2 btn bg-gradient-success',
                    extend: 'excelHtml5',
                    text: '<i class="fas fa-file-excel"></i>&nbsp;&nbsp;&nbsp;Xuất Excel',
                    autoFilter: true,
                    sheetName: 'NhanVien',
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

}())