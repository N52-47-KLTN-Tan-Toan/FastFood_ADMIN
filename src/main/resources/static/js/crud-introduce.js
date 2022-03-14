// Initialize Firebase
firebase.initializeApp(firebaseConfig);

$(document).ready(function () {

    $('#loading-event-introduce').hide()
    $('#loading-notification').hide()

    assignDataToTable()

    //Trả dữ liệu modal thêm khách hàng về rỗng
    $(document).on('click', '#add-btn', function () {
        $("#ma-gioi-thieu").val(0)
        $("#ten").val('')
        $("#tieu-de").val('')
        $("#noi-dung").val('')
        $("#image-upload-firebase").attr("src", "https://cdn-icons-png.flaticon.com/512/1040/1040241.png")
    })

    let id_edit = 0;
    //Lấy dữ liệu đối tượng từ nút edit
    $('table').on('click', '.edit-btn', function (e) {

        let btn_id = this.id.split("_")[2];

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
        });
    })

    //Tạo mới khách hàng và cập nhật khách hàng
    $("#create-update-introduce").submit(function (evt) {
        evt.preventDefault()

        const ref = firebase.storage().ref()
        const file = document.querySelector("#file-upload-firebase").files[0]

        var id = $("#ma-gioi-thieu").val()
        let name
        let task

        if (id == 0) {
            //convert hình ảnh upload
            try {
                name = +new Date() + "-" + file.name
            } catch (e) {
                toastr.warning('Vui lòng chọn hình ảnh thích hợp!!!')
                return false;
            }
            const metadata = {
                contentType: file.type
            };

            task = ref.child(name).put(file, metadata);
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
                    });
                })
                .catch(console.error);
        } else if (id != 0) {
            //Cập nhật thông tin đối tượng có hoặc không cập nhật ảnh trên firebase
            if ($('#file-upload-firebase').val() == "") {
                //Không có cập nhật ảnh
                const url = $('#img_' + id).prop('src')
                $('#loading-event-introduce').show()
                updateProduct(url);
            } else {
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
                $('#loading-event-introduce').show()
                deleteImageToStorageById(id, url_api_introduce)
                task
                    .then(snapshot => snapshot.ref.getDownloadURL())
                    .then(url => {
                        updateProduct(url)
                    })
                    .catch(console.error)
            }
        }

        //Hàm cập nhật khách hàng
        function updateProduct(url) {
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
                    });
                },
                error: function (err) {
                    alert("Error -> " + err)
                }
            });
        }
    });

    let id_del = 0

    //Hiển thị modal thông báo xóa giới thiệu
    $('table').on('click', '.delete-btn', function () {

        let btn_id = this.id;
        id_del = btn_id.split("_")[2];

        $.ajax({
            type: 'GET',
            contentType: "application/json",
            url: url_api_introduce + '/' + id_del,
            success: function (data) {
                $("#modal-overlay .modal-body").text("Xóa phần giới thiệu \"" + id_del + "\" ra khỏi danh sách?")
            },
            error: function (err) {
                alert("Error -> " + err);
            }
        });

    })

    //Xóa giới thiệu theo id
    $(document).on("click", "#modal-accept-btn", function () {

        $('#loading-notification').show();

        deleteImageToStorageById(id_del, url_api_introduce);

        //Delete Object by id
        $.ajax({
            type: "DELETE",
            url: url_api_introduce + '/' + id_del,
            success: function (data) {
                loadingModalAndRefreshTable($('#loading-event-introduce'), $('#example2'));
                toastr.success('Phần giới thiệu \"' + id_del + '\" đã xóa ra khỏi danh sách.');
            },
            error: function (err) {
                loadingModalAndRefreshTable($('#loading-event-introduce'), $('#example2'));
                toastr.error('Quá nhiều yêu cầu. Vui lòng thử lại sau')
            }
        });
    })

    //Hiển thị dữ liệu
    function assignDataToTable() {
        var t = $("#example2").DataTable({
            paging: true,
            lengthChange: true,
            searching: true,
            ordering: true,
            info: true,
            autoWidth: false,
            responsive: true,
            //Thay đổi ngôn ngữ của bảng
            oLanguage: {
                // sLengthMenu: 'Hiển thị _MENU_ đơn hàng',
                sSearch: 'Tìm kiếm',
                sInfo: 'Đang hiển thị Trang _START_ | _END_ trên _TOTAL_ đơn hàng.',
                sEmptyTable: 'Không có dữ liệu để hiển thị',
                sProcessing: "Đang tải dữ liệu...",
                oPaginate: {
                    sFirst: 'Đầu',
                    sLast: 'Cuối',
                    sNext: '>',
                    sPrevious: '<'
                },
            },
            pagingType: 'full_numbers',
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
                }
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
                }
            }, {
                class: 'text-center',
                data: 'maGT',
                render: function (data, type, row, meta) {
                    return '  <button id="btn_delete_' + row.maGT + '" class="btn bg-gradient-danger delete-btn" ' +
                        'data-toggle="modal" data-target="#modal-overlay"><i class="fas fa-trash-alt"></i></button>'
                }
            }]
        });

        //Tạo số thứ tự bắt đầu từ 1 vào cột mã
        t.on('order.dt search.dt', function () {
            t.column(0, {search: 'applied', order: 'applied'}).nodes().each(function (cell, i) {
                cell.innerHTML = i + 1;
            });
        }).draw();
    }

});