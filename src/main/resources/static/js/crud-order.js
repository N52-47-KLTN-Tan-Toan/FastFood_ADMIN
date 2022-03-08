$(document).ready(function () {

    //Khai báo biến toast để hiển thị thông báo
    var Toast = Swal.mixin({
        toast: true,
        position: 'top-end',
        showConfirmButton: false,
        timer: 5000
    });

    let d = new Date();

    let month = d.getMonth()+1;
    let day = d.getDate();

    let output = d.getFullYear() + '-' +
        (month<10 ? '0' : '') + month + '-' +
        (day<10 ? '0' : '') + day;

    $('#loading-event-order').hide();
    $('#loading-notification').hide();

    assignDataToTable1();


    //Trả dữ liệu modal thêm mặt hàng về rỗng
    $(document).on('click', '#add-btn-order', function () {
        $("#ma-don-dat-hang").val(0);
        $("#ngay-dat-hang").val(output);
        $("#trang-thai").val('');
        $("#dia-chi-giao-hang").val('');

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
            url: 'http://localhost:8000/api/v1/don-dat-hang/' + id_edit,
            success: function (data) {
                $("#ma-don-dat-hang").val(id_edit);
                $("#ngay-dat-hang").val(data.ngayDatHang);
                $("#trang-thai").val(data.trangThai);
                $("#dia-chi-giao-hang").val(data.diaChiGiaoHang);
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
                url: "http://localhost:8000/api/v1/don-dat-hang",
                data: JSON.stringify({
                    ngayDatHang: $("#ngay-dat-hang").val(),
                    trangThai: $("#trang-thai").val(),
                    diaChiGiaoHang: $("#dia-chi-giao-hang").val(),
                }),

                contentType: "application/json",
                success: function (data) {
                    loadingModalAndRefreshTable();
                    toastr.success(data.maDDD + ' đã được thêm vào.')
                },
                error: function (err) {
                    toastr.error('Đã có lỗi xảy ra. Thêm thất bại!!!')
                }
            });
        } else if (id > 0) {
            //Cập nhật thông tin đối tượng có hoặc không cập nhật ảnh trên firebase

            //Không có cập nhật ảnh
            $('#loading-event-order').show();
            updateTypeProduct();

            //Hàm cập nhật loại mặt hàng
            function updateTypeProduct() {
                $.ajax({
                    type: "PUT",
                    data: JSON.stringify({
                        ngayDatHang: $("#ngay-dat-hang").val(),
                        trangThai: $("#trang-thai").val(),
                        diaChiGiaoHang: $("#dia-chi-giao-hang").val(),
                    }),
                    contentType: "application/json",
                    url: "http://localhost:8000/api/v1/don-dat-hang/" + id,
                    success: function (data) {
                        loadingModalAndRefreshTable();
                        toastr.success('Đơn đặt hàng ' + data.maDDD + ' đã được chỉnh sửa.')
                    },
                    error: function (err) {
                        $('#loading-event-order').hide();
                        toastr.error('Đã có lỗi xảy ra. Cập nhật thất bại!!!')
                    }
                });
            }
        }
    })


    //Hàm hiển thị loading trên modal, đóng modal và load lại table
    function loadingModalAndRefreshTable() {
        $('#loading-event-order').hide();
        $('.modal').each(function () {
            $(this).modal('hide');
        });
        $('#example2').DataTable().ajax.reload(null, false);
    }

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
            url: "http://localhost:8000/api/v1/don-dat-hang/" + id_del,
            success: function (data) {
                $('#loading-notification').hide();
                $('.modal').each(function () {
                    $(this).modal('hide');
                });
                $('#example2').DataTable().ajax.reload(null, false);
                toastr.success('Đơn đặt hàng \"' + id_del + '\" đã xóa ra khỏi danh sách.');
            },
            error: function (err) {
                $('#loading-event-order').hide();
                toastr.error('Đã có lỗi xảy ra. Xóa thất bại');
            }
        });
    })


//Hiển thị dữ liệu
    function assignDataToTable1() {
        var t = $("#example2").DataTable({
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

            //Tạo id cho mỗi thẻ tr
            fnCreatedRow: function (nRow, aData, iDataIndex) {
                $(nRow).attr('id', 'tr_' + aData.maDDH); // or whatever you choose to set as the id
            },
            ajax: {
                url: "http://localhost:8000/api/v1/don-dat-hang",
                type: "GET",
                contentType: "application/json",
                dataSrc: function (d) {
                    return d
                },
            },

            columns: [{
                class: 'text-center',
                data: 'maDDH',
            }, {
                class: 'td_khachHang',
                data: 'khachHang',
            }, {
                class: 'td_ngayDatHang',
                data: 'ngayDatHang',
            }, {
                class: 'td_trangThai',
                data: 'trangThai',
            }, {
                class: 'td_diaChiGiaoHang',
                data: 'diaChiGiaoHang',
            }, {
                class: 'text-center',
                data: 'maDDH',
                render: function (data, type, row, meta) {
                    return '<button id="btn_edit_' + row.maDDH + '" class="btn bg-gradient-warning edit-btn" ' +
                        'data-toggle="modal" data-target="#modal-xl"><i class="fas fa-marker"></i></button>' +
                        '  <button id="btn_delete_' + row.maDDH + '" class="btn bg-gradient-danger delete-btn" ' +
                        'data-toggle="modal" data-target="#modal-overlay"><i class="fas fa-trash-alt"></i></button>';

                },
            }, {
                class: 'text-center',
                data: 'maDDH',
                render: function (data, type, row, meta) {
                    return '<button id="btn_view_' + row.maDDH + '" class="btn bg-gradient-navy view-btn">' +
                        '<i class="fas fa-eye"></i></button>' +
                        '  <button id="btn_print_' + row.maDDH + '" class="btn bg-gradient-indigo print-btn">' +
                        '<i class="fas fa-print"></i></button>';

                },
            }]
        });

        //Tạo số thứ tự bắt đầu từ 1 vào cột mã
        t.on('order.dt search.dt', function () {
            t.column(0, {search: 'applied', order: 'applied'}).nodes().each(function (cell, i) {
                cell.innerHTML = i + 1;
            });
        }).draw();
    };

});