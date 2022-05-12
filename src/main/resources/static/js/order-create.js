;(function () {

    const ADDRESS = '12 Nguyễn Văn Bảo, Phường 4, Gò Vấp, Thành phố Hồ Chí Minh'
    $('#address').val(ADDRESS)

    renderTableProduct()

    $('#deliveryMethod').change(function () {
        switch ($(this).val()) {
            case 'Giao tận nơi':
                $.ajax({
                    type: 'GET',
                    url: url_api_client + '/' + window.location.pathname.split('/')[3],
                    contentType: 'application/json',
                    success: function (client) {
                        $('#address').val(client.address)
                    },
                    error: function (err) {
                        alert(err)
                    }
                })
                break
            case 'Dùng tại chỗ':
                $('#address').val(ADDRESS)
                break
            default:
                $('#address').val('')
                break
        }
    })

    //Chọn mặt hàng để thêm vào chi tiết
    $('#tbl-product').on('click', '.chooseProduct', function () {
        let maMH = this.id.split("_")[2]
        $('#btn_choose_' + maMH).prop('disabled', true).text('Đã chọn').removeClass('chooseProduct')

        $.ajax({
            type: 'GET',
            url: url_api_product + '/' + maMH,
            contentType: 'application/json',
            success: function (matHang) {
                $.ajax({
                    type: 'POST',
                    url: url_api_orderdetail,
                    data: JSON.stringify({
                        soLuongDat: 1,
                        matHang: {
                            maMH: maMH
                        },
                        donDatHang: {
                            maDDH: $('#orderID').text()
                        },
                        donGia: matHang.donGia * 1
                    }),

                    contentType: 'application/json',
                    success: function () {
                        // toastr.success('Đã chọn món "' + matHang.tenMH + '"')
                        $('#tbl-order-detail').DataTable().ajax.reload(null, false)
                    },
                    error: function () {
                        toastr.error('Quá nhiều yêu cầu. Vui lòng thử lại sau')
                    }
                })
            },
            error: function (err) {
                alert(err)
            }
        })
    })

    //Xóa mặt hàng trong chi tiết đơn hàng
    $('#tbl-order-detail').on('click', '.removeBtn', function () {
        let maMH = this.id.split("_")[3]
        let maCTDDH = this.id.split("_")[2]

        $.ajax({
            type: 'DELETE',
            url: url_api_orderdetail + '/' + maCTDDH,
            contentType: 'application/json',
            success: function () {
                $('#tbl-product').DataTable().on('draw', function () {
                    $('#btn_choose_' + maMH)
                        .prop('disabled', false)
                        .text('Chọn')
                        .addClass('chooseProduct')
                })
                $('#tbl-product').DataTable().ajax.reload(null, false)
                $('#tbl-order-detail').DataTable().ajax.reload(null, false)
            },
            error: function () {
                toastr.error('Quá nhiều yêu cầu. Vui lòng thử lại sau')
            }
        })
    })

    //Thay đổi số lượng và cập nhật lại bảng (thành tiền, tổng tiền)
    $('#tbl-order-detail').on('keyup change', '.qtyBtn', function () {
        let maMH = this.id.split("_")[3]
        let maCTDDH = this.id.split("_")[2]
        let qty = this.value

        if (qty < 1) {
            qty = 1
        }

        setTimeout(function changeQuantity() {
            $.ajax({
                type: 'GET',
                url: url_api_product + '/' + maMH,
                contentType: 'application/json',
                success: function (matHang) {
                    $.ajax({
                        type: 'PUT',
                        url: url_api_orderdetail + '/' + maCTDDH,
                        data: JSON.stringify({
                            soLuongDat: qty,
                            matHang: {
                                maMH: maMH
                            },
                            donDatHang: {
                                maDDH: $('#orderID').text()
                            },
                            donGia: matHang.donGia * qty
                        }),
                        contentType: 'application/json',
                        success: function () {
                            $('#tbl-order-detail').DataTable().ajax.reload(null, false)
                        },
                        error: function () {
                            toastr.error('Quá nhiều yêu cầu. Vui lòng thử lại sau')
                        }
                    })
                },
                error: function (err) {
                    alert(err)
                }
            })
        }, 1000)
    })

    $('.cancelBtn').click(function () {
        $.ajax({
            type: 'DELETE',
            url: url_api_order + '/' + $('#orderID').text(),
            contentType: 'application/json',
            success: function () {
                window.location.href = '/khach-hang'
            },
            error: function () {
                toastr.error('Quá nhiều yêu cầu. Vui lòng thử lại sau')
            }
        })
    })

    $('.saveBtn').click(function () {
        var totalCost = 0.0

        $.ajax({
            type: 'GET',
            url: url_api_orderdetail + '/donDatHang=' + $('#orderID').text(),
            contentType: 'application/json',
            success: function (res) {
                if (res.length == 0) {
                    toastr.warning('Chi tiết đơn đặt rỗng. Vui lòng chọn món để tiếp tục')
                    return false
                }

                $.each(res, (i, data) => {
                    totalCost += data.donGia
                })

                $.ajax({
                    type: 'GET',
                    url: url_api_order + '/' + $('#orderID').text(),
                    contentType: 'application/json',
                    success: function (res) {
                        $.ajax({
                            type: 'PUT',
                            url: url_api_order + '/' + res.maDDH,
                            data: JSON.stringify({
                                trangThai: 'Chờ xác nhận',
                                ngayDatHang: res.ngayDatHang,
                                khachHang: {
                                    userId: res.khachHang.userId
                                },
                                tongTien: totalCost,
                                hinhThuc: $('#deliveryMethod').val(),
                                diaChiGiaoHang: $('#address').val()
                            }),

                            contentType: 'application/json',
                            success: function () {
                                toastr.success('Tạo đơn hàng thành công.')
                                window.location.href = '/order'
                            },
                            error: function () {
                                toastr.error('Quá nhiều yêu cầu. Vui lòng thử lại sau')
                            }
                        })
                    },
                    error: function (err) {
                        alert(err)
                    }
                })
            },
            error: function (err) {
                alert(err)
            }
        })
    })

    function renderTableProduct() {
        var tblProduct = $("#tbl-product").DataTable({
            paging: true,
            pagingType: 'full_numbers',
            lengthChange: true,
            searching: true,
            ordering: true,
            info: false,
            autoWidth: false,
            responsive: false,
            processing: true,
            lengthMenu: [[5, 10, 20, -1], [5, 10, 20, 'Tất cả']],
            //Thay đổi ngôn ngữ của bảng
            oLanguage: {
                sLengthMenu: 'Hiển thị _MENU_ món ăn',
                sSearch: 'Tìm kiếm',
                sInfo: 'Đang hiển thị từ _START_ đến _END_ trên _TOTAL_ món ăn.',
                sEmptyTable: 'Không có dữ liệu để hiển thị',
                sProcessing: "Đang tải dữ liệu...",
                oPaginate: {
                    sFirst: 'Đầu',
                    sLast: 'Cuối',
                    sNext: '>',
                    sPrevious: '<'
                },
            },
            ajax: {
                url: url_api_product,
                type: "GET",
                contentType: "application/json",
                dataSrc: function (d) {
                    return d
                },
            },
            columns: [{
                data: 'tenMH'
            }, {
                data: 'donViTinh'
            }, {
                data: 'donGia',
                render: $.fn.dataTable.render.number(',', '.', 0, '', ' VND')

            }, {
                class: 'text-center',
                data: 'maMH',
                render: function (data, type, row, meta) {
                    return '<button id="btn_choose_' + row.maMH + '" class="btn bg-gradient-primary chooseProduct"' +
                        '>Chọn</button>'
                },
                searchable: false, orderable: false, visible: true
            }]
        })

        var tblOrderDetail = $('#tbl-order-detail').DataTable({
            paging: false,
            pagingType: 'full_numbers',
            lengthChange: false,
            searching: false,
            ordering: true,
            info: false,
            autoWidth: true,
            responsive: true,
            processing: false,
            scrollY: 175,
            scrollX: true,
            scrollCollapse: true,
            scroller: true,
            //Thay đổi ngôn ngữ của bảng
            oLanguage: {
                sEmptyTable: 'Không có dữ liệu để hiển thị',
            },
            ajax: {
                url: url_api_orderdetail + '/donDatHang=' + $('#orderID').text(),
                type: "GET",
                contentType: "application/json",
                dataSrc: function (d) {
                    return d
                },
            },
            columns: [{
                data: 'matHang.tenMH'
            }, {
                data: 'soLuongDat',
                render: function (data, type, row, meta) {
                    tblProduct.on('draw', function () {
                        $('#btn_choose_' + row.matHang.maMH)
                            .prop('disabled', true)
                            .text('Đã chọn')
                            .removeClass('chooseProduct')
                    })
                    return '<input type="number" id="btn_qty_' + row.maCTDDH + '_' + row.matHang.maMH + '" ' +
                        'value="' + row.soLuongDat + '" class="qtyBtn">'
                }
            }, {
                data: 'donGia',
                render: $.fn.dataTable.render.number(',', '.', 0, '', ' VND')
            }, {
                class: 'py-0 align-middle',
                data: 'maCTDDH',
                render: function (data, type, row, meta) {
                    return '<div class="btn-group btn-group-sm">' +
                        '<button id="btn_del_' + row.maCTDDH + '_' + row.matHang.maMH + '" class="btn btn-danger removeBtn">' +
                        '<i class="fas fa-trash"></i>' +
                        '</button>' +
                        '</div>'
                },
                searchable: false, orderable: false, visible: true
            }],
            footerCallback: function (row, data, start, end, display) {
                var api = this.api()

                var intVal = function (i) {
                    return typeof i === 'string' ?
                        i.replace(/[\, VND]/g, '') * 1 : typeof i === 'number' ? i : 0
                }

                // Total over all pages
                var total = api.column(2).data().reduce(function (a, b) {
                    return intVal(a) + intVal(b)
                }, 0)

                // Update footer
                $(api.column(2).footer()).html('<span id="totalCost">' + total.toLocaleString('it-IT',
                    {style: 'currency', currency: 'VND'}) + '</span>')

            }
        })

        tblProduct.ajax.reload(null, false)
    }

}())

