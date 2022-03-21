$(document).ready(function () {

    let d = new Date();

    let month = d.getMonth() + 1;
    let day = d.getDate();

    let output = d.getFullYear() + '-' +
        (month < 10 ? '0' : '') + month + '-' +
        (day < 10 ? '0' : '') + day;

    var totalCost = 0.0

    $('#loading-event-order').hide();
    $('#loading-notification').hide();

    assignDataToTable1();

    //Trả dữ liệu modal thêm mặt hàng về rỗng
    // $(document).on('click', '#add-btn-order', function () {
    //     $("#ma-don-dat-hang").val(0)
    //     $("#ngay-dat-hang").val(output)
    //     $("#trang-thai").val('Chờ xác nhận')
    //     $("#dia-chi-giao-hang").val('Tại chỗ')
    //     $("#hinh-thuc").val('Dùng tại chỗ')
    //
    //     $("#trang-thai").prop('disabled', true)
    //     $("#dia-chi-giao-hang").prop('disabled', true)
    //     $("#hinh-thuc").prop('disabled', true)
    //
    // })

    let id_edit = 0;
    //Lấy dữ liệu đối tượng từ nút edit
    $('table').on('click', '.edit-btn', function (e) {
        $("#trang-thai").prop('disabled', false)
        $("#dia-chi-giao-hang").prop('disabled', false)
        $("#hinh-thuc").prop('disabled', false)
        let btn_id = this.id;
        id_edit = btn_id.split("_")[2];

        //Find Object by id
        $.ajax({
            type: 'GET',
            contentType: "application/json",
            url: url_api_order + '/' + id_edit,
            success: function (data) {
                $("#ma-don-dat-hang").val(id_edit)
                $("#trang-thai").val(data.trangThai)
                $("#tong-tien").val(data.tongTien)
            },
            error: function (err) {
                alert("Error -> " + err);
            }
        });
    })

    //Tạo mới loại mặt hàng và cập nhật loại mặt hàng
    $("#create-update-order").submit(function (evt) {
        evt.preventDefault();

        var id = $("#ma-don-dat-hang").val();


        if (id == 0) {
            $('#loading-event-order').show();

            //Thêm mới đối tượng
            $.ajax({
                type: "POST",
                url: url_api_order,
                data: JSON.stringify({
                    ngayDatHang: $("#ngay-dat-hang").val(),
                    trangThai: $("#trang-thai").val(),
                    diaChiGiaoHang: $("#dia-chi-giao-hang").val(),
                    hinhThuc: 'Dùng tại chỗ'
                }),

                contentType: "application/json",
                success: function (data) {
                    loadingModalAndRefreshTable($('#loading-event-order'), $('#example2'))
                    toastr.success(data.maDDD + ' đã được thêm vào.')
                },
                error: function (err) {
                    loadingModalAndRefreshTable($('#loading-event-order'), $('#example2'))
                    toastr.error('Quá nhiều yêu cầu. Vui lòng thử lại sau')
                }
            });
        } else if (id > 0) {
            //Cập nhật thông tin đối tượng có hoặc không cập nhật ảnh trên firebase

            //Không có cập nhật ảnh
            $('#loading-event-order').show();
            updateTypeProduct();

            //Hàm cập nhật hóa đơn
            function updateTypeProduct() {
                $.ajax({
                    type: 'GET',
                    contentType: "application/json",
                    url: url_api_order + '/' + id,
                    success: function (data) {
                        $.ajax({
                            type: "PUT",
                            data: JSON.stringify({
                                ngayDatHang: data.ngayDatHang,
                                trangThai: $("#trang-thai").val(),
                                diaChiGiaoHang: data.diaChiGiaoHang,
                                hinhThuc: data.hinhThuc,
                                soDienThoai: data.soDienThoai,
                                tongTien: $("#tong-tien").val(),
                                khachHang: {
                                    userId: data.khachHang.userId
                                }
                            }),
                            contentType: "application/json",
                            url: url_api_order + '/' + id,
                            success: function (orders) {
                                loadingModalAndRefreshTable($('#loading-event-order'), $('#example2'))
                                toastr.success('Đơn đặt hàng ' + orders.maDDH + ' đã được chỉnh sửa.')
                                if (orders.trangThai == 'Đã thanh toán'){
                                    $.ajax({
                                        type: 'GET',
                                        contentType: "application/json",
                                        url: url_api_orderdetail + '/donDatHang=' + orders.maDDH,
                                        success: function (ods) {
                                            $.each(ods, (i, obj) => {
                                                totalCost += obj.matHang.donGia * obj.soLuongDat
                                            })
                                            $.ajax({
                                                type: 'GET',
                                                contentType: "application/json",
                                                url: url_api_client + '/' + orders.khachHang.userId,
                                                success: function (user) {
                                                    $.ajax({
                                                        type: "PUT",
                                                        data: JSON.stringify({
                                                            name: user.name,
                                                            birthDate: user.birthDate,
                                                            phone: user.phone,
                                                            email: user.email,
                                                            address: user.address,
                                                            gender: user.gender,
                                                            avatar: user.avatar,
                                                            roleName: user.roleName,
                                                            password: user.password,
                                                            diemTichLuy: parseInt(totalCost / 10000)
                                                        }),
                                                        contentType: "application/json",
                                                        url: url_api_client + '/' + orders.khachHang.userId,
                                                        success: function (data) {
                                                        },
                                                        error: function (err) {
                                                        }
                                                    });
                                                },
                                                error: function (err) {
                                                    alert("Error -> " + err)
                                                }
                                            });
                                        },
                                        error: function (err) {
                                            alert("Error -> " + err);
                                        }
                                    });
                                }
                            },
                            error: function (err) {
                                loadingModalAndRefreshTable($('#loading-event-order'), $('#example2'))
                                toastr.error('Quá nhiều yêu cầu. Vui lòng thử lại sau')
                            }
                        });
                    },
                    error: function (err) {
                        alert("Error -> " + err);
                    }
                })
            }
        }
    })

    let id_del = 0;

    // Hiển thị modal thông báo xóa loại mặt hàng
    $('table').on('click', '.delete-btn', function () {
        let btn_id = this.id;
        id_del = btn_id.split("_")[2];

        $("#modal-overlay .modal-body").text("Xóa đơn đặt hàng \"" + id_del + "\" ra khỏi danh sách?");
    })

    // Xóa loại mặt hàng theo id và xóa dòng liên quan trên bảng
    $(document).on("click", "#modal-accept-btn", function () {

        $('#loading-notification').show();

        // Delete Object by id
        $.ajax({
            type: "DELETE",
            url: url_api_order + '/' + id_del,
            success: function (data) {
                loadingModalAndRefreshTable($('#loading-event-order'), $('#example2'))
                toastr.success('Đơn đặt hàng \"' + id_del + '\" đã xóa ra khỏi danh sách.')
            },
            error: function (err) {
                loadingModalAndRefreshTable($('#loading-event-order'), $('#example2'))
                toastr.error('Đã có lỗi xảy ra. Xóa thất bại')
            }
        });
    })


//Hiển thị dữ liệu
    function assignDataToTable1() {
        var t = $("#example2").DataTable({
            paging: true,
            pagingType: 'full_numbers',
            lengthChange: true,
            searching: true,
            ordering: true,
            lengthMenu: [[5, 10, 20, -1], [5, 10, 20, 'Tất cả']],
            //Thay đổi ngôn ngữ của bảng
            oLanguage: {
                sLengthMenu: 'Hiển thị _MENU_ đơn hàng',
                sSearch: 'Tìm kiếm',
                sInfo: 'Đang hiển thị từ _START_ đến _END_ trên _TOTAL_ đơn hàng.',
                sEmptyTable: 'Không có dữ liệu để hiển thị',
                sProcessing: "Đang tải dữ liệu...",
                oPaginate: {
                    sFirst: 'Đầu',
                    sLast: 'Cuối',
                    sNext: '>',
                    sPrevious: '<'
                },
            },
            autoWidth: false,
            responsive: true,
            processing: true,
            order: [[4, 'asc']],
            //Tạo id cho mỗi thẻ tr
            fnCreatedRow: function (nRow, aData, iDataIndex) {
                $(nRow).attr('id', 'tr_' + aData.maDDH); // or whatever you choose to set as the id
            },
            ajax: {
                url: url_api_order + '/trangThai',
                type: "GET",
                contentType: "application/json",
                dataSrc: function (d) {
                    return d
                },
            },
            initComplete: function () {
                this.api().columns([4, 5]).every(function () {
                    var column = this;
                    var select = $('<select><option value=""></option></select>')
                        .appendTo($(column.footer()).empty())
                        .on('change', function () {
                            var val = $.fn.dataTable.util.escapeRegex(
                                $(this).val()
                            );

                            column
                                .search(val ? '^' + val + '$' : '', true, false)
                                .draw();
                        });

                    column.data().unique().sort().each(function (d, j) {
                        select.append('<option value="' + d + '">' + d + '</option>')
                    });
                });
            },
            columns: [{
                class: 'text-center',
                data: 'maDDH',
            }, {
                class: 'td_phone',
                data: 'khachHang.phone',
            }, {
                class: 'td_khachHang',
                data: 'khachHang.name',
            }, {
                class: 'td_ngayDatHang',
                data: 'ngayDatHang',
                render: $.fn.dataTable.render.moment('YYYY-MM-DD', 'DD/MM/YYYY')
            }, {
                class: 'td_trangThai',
                data: 'trangThai',
                render: function (data, type, row, meta) {
                    if (row.trangThai == 'Chờ xác nhận') {
                        return '<button class="btn btn-block bg-gradient-danger btn-sm text-white">' + row.trangThai + '</button>'
                    } else {
                        return '<button class="btn btn-block bg-gradient-warning btn-sm text-black">' + row.trangThai + '</button>'
                    }
                }
            }, {
                data: 'hinhThuc',
            }, {
                class: 'td_tongTien',
                data: 'tongTien',
                render: $.fn.dataTable.render.number(',', '.', 0, '', ' VND')
            }, {
                class: 'td_diaChiGiaoHang',
                data: 'diaChiGiaoHang',
            }, {
                class: 'text-center',
                data: 'maDDH',
                render: function (data, type, row, meta) {
                    return '<button id="btn_edit_' + row.maDDH + '" class="btn bg-gradient-primary btn-sm text-white edit-btn" ' +
                        'data-toggle="modal" data-target="#modal-xl"><i class="fas fa-marker"></i></button>'
                }
            }, {
                class: 'text-center',
                data: 'maDDH',
                render: function (data, type, row, meta) {
                    return '  <button id="btn_delete_' + row.maDDH + '" class="btn bg-gradient-secondary btn-sm delete-btn" ' +
                        'data-toggle="modal" data-target="#modal-overlay"><i class="fas fa-trash-alt"></i></button>'
                }
            }, {
                class: 'text-center',
                data: 'maDDH',
                render: function (data, type, row, meta) {
                    return '  <a href="/order/print?orderId=' + row.maDDH + '" rel="noopener" target="_blank" id="btn_print_' + row.maDDH + '" ' +
                        'class="btn bg-gradient-indigo btn-sm print-btn">' +
                        '<i class="fas fa-print"></i></a>'
                }
            }]
        })

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
})