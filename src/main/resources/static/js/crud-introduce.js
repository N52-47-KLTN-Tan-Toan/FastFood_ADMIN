// Initialize Firebase
firebase.initializeApp(firebaseConfig)

;(function () {

    // Các ràng buộc cho field
    var rules = {
        ten: {
            required: true,
            maxlength: 50
        },
        tieuDe: {
            required: true,
            maxlength: 50
        },
        noiDung: {
            required: true,
            maxlength: 50
        }
    }

    // Các thông báo khi bắt lỗi
    var mess = {
        ten: {
            required: 'Vui lòng điền tên thông tin giới thiệu',
            maxlength: 'Tên thông tin giới thiệu tối đa 50 ký tự'
        },
        tieuDe: {
            required: 'Vui lòng điền tiêu đề',
            maxlength: 'Tiêu đề tối đa 50 ký tự'
        },
        noiDung: {
            required: 'Vui lòng điền nội dung',
            maxlength: 'Nội dung tối đa 50 ký tự'
        }
    }

    $('#loading-event-introduce').hide()
    $('#loading-notification').hide()

    assignDataToTable()

    uploadFileExcel(url_api_introduce)

    //Trả dữ liệu modal về rỗng
    $(document).on('click', '.add-btn-intro', function () {
        $("#ma-gioi-thieu").val(0)
        $("#ten").val('')
        $("#tieu-de").val('')
        $("#noi-dung").val('')
        $("#image-upload-firebase").attr("src", "https://cdn-icons-png.flaticon.com/512/1040/1040241.png")
    })

    //Lấy dữ liệu đối tượng từ nút edit
    $('table').on('click', '.edit-btn', function (e) {

        let btn_id = this.id.split("_")[2]

        //Find Object by id
        $.ajax({
            type: 'GET',
            contentType: "application/json",
            url: url_api_introduce + '/' + btn_id,
            success: function (data) {
                $("#ma-gioi-thieu").val(btn_id)
                $("#ten").val(data.ten)
                $("#noi-dung").val(data.noiDung)
                $("#tieu-de").val(data.tieuDe)
                $("#image-upload-firebase").attr("src", data.hinhAnh)
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

            var id = $("#ma-gioi-thieu").val()
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
                $('#loading-event-introduce').show();
                task
                    .then(snapshot => snapshot.ref.getDownloadURL())
                    .then(url => {
                        $.ajax({
                            type: "POST",
                            url: url_api_introduce,
                            data: JSON.stringify({
                                ten: $("#ten").val(),
                                tieuDe: $("#tieu-de").val(),
                                noiDung: $("#noi-dung").val(),
                                hinhAnh: url
                            }),

                            contentType: "application/json",
                            success: function (data) {
                                loadingModalAndRefreshTable($('#loading-event-introduce'), $('#example2'))
                                toastr.success(data.name + ' đã được thêm vào.')
                            },
                            error: function (err) {
                                loadingModalAndRefreshTable($('#loading-event-introduce'), $('#example2'))
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
                    $('#loading-event-introduce').show()
                    updateTypeProduct(url)

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
                    }
                    const task = ref.child(name).put(file, metadata)

                    //Có cập nhật ảnh
                    $('#loading-event-introduce').show()
                    deleteImageToStorageById(id, url_api_introduce)
                    task
                        .then(snapshot => snapshot.ref.getDownloadURL())
                        .then(url => {
                            updateTypeProduct(url)
                        })
                        .catch(console.error)
                }

            }

            //Hàm cập nhật bảng giới thiệu
            function updateTypeProduct(url) {
                $.ajax({
                    type: 'GET',
                    contentType: "application/json",
                    url: url_api_introduce + '/' + id,
                    success: function (data) {
                        $.ajax({
                            type: "PUT",
                            data: JSON.stringify({
                                ten: $("#ten").val(),
                                tieuDe: $("#tieu-de").val(),
                                noiDung: $("#noi-dung").val(),
                                hinhAnh: url,
                            }),
                            contentType: "application/json",
                            url: url_api_introduce + '/' + id,
                            success: function (data) {
                                loadingModalAndRefreshTable($('#loading-event-introduce'), $('#example2'))
                                toastr.success('Phần giới thiệu ' + data.maGT + ' đã được chỉnh sửa.')
                            },
                            error: function (err) {
                                loadingModalAndRefreshTable($('#loading-event-introduce'), $('#example2'))
                                toastr.error('Quá nhiều yêu cầu. Vui lòng thử lại sau')
                            }
                        })
                    },
                    error: function (err) {
                        alert("Error -> " + err)
                    }
                })
            }
        }
    })
    validateForm($('#create-update-introduce'), rules, mess)

    //Hiển thị modal thông báo xóa giới thiệu
    $('table').on('click', '.delete-btn', function () {

        let btn_id = this.id
        introId = btn_id.split("_")[2]

        $('#modal-overlay .modal-body').text('Xóa phần giới thiệu "' + introId + '" ra khỏi danh sách?')

    })

    //Xóa giới thiệu theo id hiển thị trên modal thông báo
    $('#modal-accept-btn').click(function () {

        $('#loading-event-introduce').show()

        deleteImageToStorageById(introId, url_api_introduce)

        //Delete Object by id
        $.ajax({
            type: "DELETE",
            url: url_api_introduce + '/' + introId,
            success: function (data) {
                loadingModalAndRefreshTable($('#loading-event-introduce'), $('#example2'))
                toastr.success('Phần giới thiệu \"' + introId + '\" đã xóa ra khỏi danh sách.')
            },
            error: function (err) {
                loadingModalAndRefreshTable($('#loading-event-introduce'), $('#example2'))
                toastr.error('Quá nhiều yêu cầu. Vui lòng thử lại sau')
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
                sLengthMenu: 'Hiển thị _MENU_ phần',
                sSearch: 'Tìm kiếm',
                sInfo: 'Đang hiển thị từ _START_ đến _END_ trên _TOTAL_ phần.',
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
                $(nRow).attr('id', 'tr_' + aData.maGT); // or whatever you choose to set as the id
            },
            ajax: {
                url: url_api_introduce,
                type: "GET",
                contentType: "application/json",
                dataSrc: function (d) {
                    return d
                },
            },

            columns: [{
                class: 'text-center',
                data: 'maGT',
            }, {
                class: 'text-center',
                data: 'hinhAnh',
                render: function (data, type, row, meta) {
                    return '<img id="img_' + row.maGT + '" src="' + data + '" width="50" height="50" />';
                },
                searchable: false, orderable: false, visible: true
            }, {
                class: 'td_ten',
                data: 'ten'
            }, {
                class: 'td_tieuDe',
                data: 'tieuDe'
            }, {
                class: 'td_noiDung',
                data: 'noiDung'
            }, {
                class: 'text-center',
                data: 'maGT',
                render: function (data, type, row, meta) {
                    return '<button id="btn_edit_' + row.maGT + '" class="btn bg-gradient-warning edit-btn" ' +
                        'data-toggle="modal" data-target="#modal-xl"><i class="fas fa-marker"></i></button>'
                },
                searchable: false, orderable: false, visible: true
            }, {
                class: 'text-center',
                data: 'maGT',
                render: function (data, type, row, meta) {
                    return '  <button id="btn_delete_' + row.maGT + '" class="btn bg-gradient-danger delete-btn" ' +
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
                        return column === 1 ? data.split('"')[3] : data
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
                    className: 'mr-1 mb-2 btn bg-gradient-info add-btn-intro',
                    text: '<i class="fas fa-plus"></i>&nbsp;&nbsp;&nbsp;Thêm',
                    action: function (e, dt, node, config) {
                        $('#modal-xl').modal('show')
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
                    title: 'T&T_FastFood_Shop_GioiThieu',
                    className: 'mr-1 mb-2 btn bg-gradient-success',
                    extend: 'excelHtml5',
                    text: '<i class="fas fa-file-excel"></i>&nbsp;&nbsp;&nbsp;Xuất Excel',
                    autoFilter: true,
                    sheetName: 'GioiThieu',
                    exportOptions: {
                        columns: [0, 1, 2, 3, 4]
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