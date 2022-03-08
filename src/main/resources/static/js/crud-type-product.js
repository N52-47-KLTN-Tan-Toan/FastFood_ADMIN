$(document).ready(function () {

    //Khai báo biến toast để hiển thị thông báo
    var Toast = Swal.mixin({
        toast: true,
        position: 'top-end',
        showConfirmButton: false,
        timer: 5000
    });

    $('#loading-event-type').hide();
    $('#loading-notification').hide();

    assignDataToTable1();


    //Trả dữ liệu modal thêm mặt hàng về rỗng
    $(document).on('click', '#add-btn-type', function () {
        $("#ma-loai-mat-hang").val(0);
        $("#ten-loai-mat-hang").val('');

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
            url: 'http://localhost:8000/api/v1/loai-mat-hang/' + id_edit,
            success: function (data) {
                $("#ma-loai-mat-hang").val(id_edit);
                $("#ten-loai-mat-hang").val(data.tenLMH);
            },
            error: function (err) {
                alert("Error -> " + err);
            }
        });
    })

    //Tạo mới loại mặt hàng và cập nhật loại mặt hàng
    $("#create-update-type-product").submit(function (evt) {
        evt.preventDefault();

        var id = $("#ma-loai-mat-hang").val();

        if (id == 0) {
            $('#loading-event-type').show();

            //Thêm mới đối tượng
            $.ajax({
                type: "POST",
                url: "http://localhost:8000/api/v1/loai-mat-hang",
                data: JSON.stringify({
                    tenLMH: $("#ten-loai-mat-hang").val(),
                }),
                contentType: "application/json",
                success: function (data) {
                    loadingModalAndRefreshTable();
                    toastr.success(data.tenLMH + ' đã được thêm vào.')
                },
                error: function (err) {
                    toastr.error('Đã có lỗi xảy ra. Thêm thất bại!!!')
                }
            });
        } else if (id > 0) {
            //Cập nhật thông tin đối tượng có hoặc không cập nhật ảnh trên firebase

            //Không có cập nhật ảnh
            $('#loading-event').show();
            updateTypeProduct();

            //Hàm cập nhật loại mặt hàng
            function updateTypeProduct() {
                $.ajax({
                    type: "PUT",
                    data: JSON.stringify({
                        tenLMH: $("#ten-loai-mat-hang").val(),
                    }),
                    contentType: "application/json",
                    url: "http://localhost:8000/api/v1/loai-mat-hang/" + id,
                    success: function (data) {
                        loadingModalAndRefreshTable();
                        toastr.success('Loại mặt hàng ' + data.maLMH + ' đã được chỉnh sửa.')
                    },
                    error: function (err) {
                        $('#loading-event-type').hide();
                        toastr.error('Đã có lỗi xảy ra. Cập nhật thất bại!!!')
                    }
                });
            }
        }
    })


    //Hàm hiển thị loading trên modal, đóng modal và load lại table
    function loadingModalAndRefreshTable() {
        $('#loading-event-type').hide();
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

        $("#modal-overlay .modal-body").text("Xóa loại mặt hàng \"" + id_del + "\" ra khỏi danh sách?");
    })

// Xóa loại mặt hàng theo id và xóa dòng liên quan trên bảng
    $(document).on("click", "#modal-accept-btn", function () {

        $('#loading-notification').show();

        // Delete Object by id
        $.ajax({
            type: "DELETE",
            url: "http://localhost:8000/api/v1/loai-mat-hang/" + id_del,
            success: function (data) {
                $('#loading-notification').hide();
                $('.modal').each(function () {
                    $(this).modal('hide');
                });
                $('#example2').DataTable().ajax.reload(null, false);
                toastr.success('Loại mặt hàng \"' + id_del + '\" đã xóa ra khỏi danh sách.');
            },
            error: function (err) {
                $('#loading-event-type').hide();
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
                $(nRow).attr('id', 'tr_' + aData.maLMH); // or whatever you choose to set as the id
            },
            ajax: {
                url: "http://localhost:8000/api/v1/loai-mat-hang",
                type: "GET",
                contentType: "application/json",
                dataSrc: function (d) {
                    return d
                },
            },

            columns: [{
                class: 'text-center',
                data: 'maLMH',
            }, {
                class: 'text-center',
                data: 'tenLMH',
            }, {
                class: 'text-center',
                data: 'maLMH',
                render: function (data, type, row, meta) {
                    return '<button id="btn_edit_' + row.maLMH + '" class="btn bg-gradient-warning edit-btn" ' +
                        'data-toggle="modal" data-target="#modal-lg"><i class="fas fa-marker"></i></button>' +
                        '  <button id="btn_delete_' + row.maLMH + '" class="btn bg-gradient-danger delete-btn" ' +
                        'data-toggle="modal" data-target="#modal-overlay"><i class="fas fa-trash-alt"></i></button>';

                }
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