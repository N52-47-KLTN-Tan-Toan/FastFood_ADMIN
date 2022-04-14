;(function () {

    // Các ràng buộc cho field
    var rules = {
        nameTypeProduct: {
            required: true,
            maxlength: 30
        }
    }

    // Các thông báo khi bắt lỗi
    var mess = {
        nameTypeProduct: {
            required: 'Vui lòng điền tên loại mặt hàng',
            maxlength: 'Tên loại mặt hàng tối đa 30 ký tự'
        }
    }

    $('#loading-event-type').hide()
    $('#loading-notification').hide()

    assignDataToTable1()

    uploadFileExcel(url_api_categories)

    //Trả dữ liệu modal thêm mặt hàng về rỗng
    $(document).on('click', '.add-btn-type', function () {

        $("#ma-loai-mat-hang").val(0)
        $("#ten-loai-mat-hang").val('')

    })

    //Lấy dữ liệu đối tượng từ nút edit
    $('table').on('click', '.edit-btn', function (e) {

        let btn_id = this.id.split("_")[2]

        //Find Object by id
        $.ajax({
            type: 'GET',
            contentType: "application/json",
            url: url_api_categories + '/' + btn_id,
            success: function (data) {
                $("#ma-loai-mat-hang").val(btn_id)
                $("#ten-loai-mat-hang").val(data.tenLMH)
            },
            error: function (err) {
                alert("Error -> " + err)
            }
        })

    })

    $.validator.setDefaults({
        submitHandler: function () {

            var id = $("#ma-loai-mat-hang").val()

            if (id == 0) {

                $('#loading-event-type').show()

                //Thêm mới đối tượng
                $.ajax({
                    type: "POST",
                    url: url_api_categories,
                    data: JSON.stringify({
                        tenLMH: $("#ten-loai-mat-hang").val(),
                    }),
                    contentType: "application/json",
                    success: function (data) {
                        loadingModalAndRefreshTable($('#loading-event-type'), $('#example2'))
                        toastr.success(data.tenLMH + ' đã được thêm vào.')
                    },
                    error: function (err) {
                        loadingModalAndRefreshTable($('#loading-event-type'), $('#example2'))
                        toastr.error('Quá nhiều yêu cầu. Vui lòng thử lại sau')
                    }
                })

            } else {

                //Cập nhật thông tin đối tượng có hoặc không cập nhật ảnh trên firebase
                $('#loading-event-type').show()
                updateTypeProduct()

                //Hàm cập nhật loại mặt hàng
                function updateTypeProduct() {
                    $.ajax({
                        type: "PUT",
                        data: JSON.stringify({
                            tenLMH: $("#ten-loai-mat-hang").val(),
                        }),
                        contentType: "application/json",
                        url: url_api_categories + '/' + id,
                        success: function (data) {
                            loadingModalAndRefreshTable($('#loading-event-type'), $('#example2'))
                            toastr.success('Loại mặt hàng ' + data.maLMH + ' đã được chỉnh sửa.')
                        },
                        error: function (err) {
                            loadingModalAndRefreshTable($('#loading-event-type'), $('#example2'))
                            toastr.error('Quá nhiều yêu cầu. Vui lòng thử lại sau')
                        }
                    })
                }
            }
        }
    })
    validateForm($('#create-update-type-product'), rules, mess)

    // Hiển thị modal thông báo xóa loại mặt hàng
    $('table').on('click', '.delete-btn', function () {

        let btn_id = this.id
        categorieId = btn_id.split('_')[2]

        $('#modal-overlay .modal-body').text('Xóa loại mặt hàng "' + categorieId + '" ra khỏi danh sách?')

    })

    // Xóa loại mặt hàng theo id và xóa dòng liên quan trên bảng
    $('#modal-accept-btn').click(function () {

        $('#loading-notification').show()

        // Delete Object by id
        $.ajax({
            type: 'DELETE',
            url: 'http://localhost:8000/api/v1/loai-mat-hang/' + categorieId,
            success: function (data) {
                loadingModalAndRefreshTable($('#loading-notification'), $('#example2'));
                toastr.success('Loại mặt hàng "' + categorieId + '" đã xóa ra khỏi danh sách.');
            },
            error: function (err) {
                loadingModalAndRefreshTable($('#loading-notification'), $('#example2'));
                toastr.error('Quá nhiều yêu cầu. Vui lòng thử lại sau')
            }
        })

    })

    //Hiển thị dữ liệu
    function assignDataToTable1() {
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
                sLengthMenu: 'Hiển thị _MENU_ loại mặt hàng',
                sSearch: 'Tìm kiếm',
                sInfo: 'Đang hiển thị từ _START_ đến _END_ trên _TOTAL_ loại mặt hàng.',
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
                $(nRow).attr('id', 'tr_' + aData.maLMH); // or whatever you choose to set as the id
            },
            ajax: {
                url: url_api_categories,
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
                        'data-toggle="modal" data-target="#modal-lg"><i class="fas fa-marker"></i></button>'
                },
                searchable: false, orderable: false, visible: true
            }, {
                class: 'text-center',
                data: 'maLMH',
                render: function (data, type, row, meta) {
                    return '  <button id="btn_delete_' + row.maLMH + '" class="btn bg-gradient-danger delete-btn" ' +
                        'data-toggle="modal" data-target="#modal-overlay"><i class="fas fa-trash-alt"></i></button>'

                },
                searchable: false, orderable: false, visible: true
            }]
        })

        var typeColumn = {
            exportOptions: {
                format: {
                    body: function (data, row, column, node) {
                        // Strip $ from salary column to make it numeric
                        return column === 5 ? data.replace(/[,VND]/g, '') : data
                        && column === 1 ? data.split('"')[3] : data
                        && column === 6 ? data.split('"')[1] : data
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
                    className: 'mr-1 mb-2 btn bg-gradient-info add-btn-type',
                    text: '<i class="fas fa-plus"></i>&nbsp;&nbsp;&nbsp;Thêm',
                    action: function (e, dt, node, config) {
                        $('#modal-lg').modal('show')
                    }
                },
                {
                    className: 'mr-1 mb-2 bg-gradient-success',
                    text: '<i class="fas fa-upload"></i>&nbsp;&nbsp;&nbsp;Tải lên',
                    action: function (e, dt, node, config) {
                        $('#modal-success').modal('show')
                    }
                },
                {
                    title: 'T&T_FastFood_Shop_LoaiMatHang',
                    className: 'mr-1 mb-2 btn bg-gradient-success',
                    extend: 'excelHtml5',
                    text: '<i class="fas fa-file-excel"></i>&nbsp;&nbsp;&nbsp;Xuất Excel',
                    autoFilter: true,
                    sheetName: 'LoaiMatHang',
                    exportOptions: {
                        columns: [0, 1]
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

}())