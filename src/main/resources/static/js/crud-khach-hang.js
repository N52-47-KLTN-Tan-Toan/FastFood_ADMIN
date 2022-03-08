// var firebaseConfig = {
//     apiKey: "AIzaSyBSLLi7jGwomqntt2Ky0RnmIdk_wM0YGL0",
//     authDomain: "n52-47-kltn-tan-toan.firebaseapp.com",
//     projectId: "n52-47-kltn-tan-toan",
//     storageBucket: "n52-47-kltn-tan-toan.appspot.com",
//     messagingSenderId: "601210556956",
//     appId: "1:601210556956:web:dc4df16ecb002d447085d9",
//     measurementId: "G-J68P4KMT72"
// };

var firebaseConfig = {
    apiKey: "AIzaSyDNvq0eJPKyc__OONXxrzJAm6mWAhwr9fQ",
    authDomain: "utopian-pilot-329813.firebaseapp.com",
    projectId: "utopian-pilot-329813",
    storageBucket: "utopian-pilot-329813.appspot.com",
    messagingSenderId: "1025160710817",
    appId: "1:1025160710817:web:73bf3b10d10e4d559c7ee0",
    measurementId: "G-44XTC5N9LW",
    databaseURL: "https://utopian-pilot-329813-default-rtdb.firebaseio.com"
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

    $('#loading-event-khach-hang').hide();
    $('#loading-notification').hide();


    assignDataToTable();

    //Trả dữ liệu modal thêm khách hàng về rỗng
    $(document).on('click', '#add-btn', function () {
        $("#ma-khach-hang").val(0);
        $("#ten-khach-hang").val('');
        $("#ngay-sinh").val('');
        $("#sdt").val('');
        $("#image-upload-firebase").attr("src", "https://cdn-icons-png.flaticon.com/512/1040/1040241.png");
        $("#email").val('');
        $("#dia-chi").val('');
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
            url: 'http://localhost:8000/api/v1/khach-hang/' + id_edit,
            success: function (data) {
                $("#ma-khach-hang").val(id_edit);
                $("#ten-khach-hang").val(data.name);
                $("#ngay-sinh").val(data.birthDate);
                $("#sdt").val(data.phone);
                $("#image-upload-firebase").attr("src", data.avatar);
                $("#email").val(data.email);
                $("#dia-chi").val(data.address);
                if (data.gender == true) {
                    $('#gender-male').prop("checked", true);
                } else {
                    $('#gender-female').prop("checked", true);
                }
            },
            error: function (err) {
                alert("Error -> " + err);
            }
        });
    })

    //Tạo mới khách hàng và cập nhật khách hàng
    $("#create-update-khach-hang").submit(function (evt) {
        evt.preventDefault();

        const ref = firebase.storage().ref();
        const file = document.querySelector("#file-upload-firebase").files[0];

        var id = $("#ma-khach-hang").val();
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
            console.log("Giới tính " + $(".rad-gender:checked").val());
            //Thêm mới đối tượng
            $('#loading-event-khach-hang').show();
            task
                .then(snapshot => snapshot.ref.getDownloadURL())
                .then(url => {
                    $.ajax({
                        type: "POST",
                        url: "http://localhost:8000/api/v1/khach-hang",
                        data: JSON.stringify({
                            name: $("#ten-khach-hang").val(),
                            birthDate: $("#ngay-sinh").val(),
                            phone: $("#sdt").val(),
                            email: $("#email").val(),
                            address: $("#dia-chi").val(),
                            gender: $(".rad-gender:checked").val() == 1 ? true : false,
                            avatar: url,

                        }),

                        contentType: "application/json",
                        success: function (data) {
                            loadingModalAndRefreshTable();
                            toastr.success(data.name + ' đã được thêm vào.')
                        },
                        error: function (err) {
                            loadingModalAndRefreshTable();
                            toastr.error('Đã có lỗi xảy ra. Thêm thất bại!!!')
                        }
                    });
                })
                .catch(console.error);
        } else if (id != 0) {
            //Cập nhật thông tin đối tượng có hoặc không cập nhật ảnh trên firebase
            if ($('#file-upload-firebase').val() == "") {
                //Không có cập nhật ảnh
                const url = $('#img_' + id).prop('src');
                $('#loading-event-khach-hang').show();
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

                //Có cập nhật ảnh
                $('#loading-event-khach-hang').show();
                deleteImageToStorageById(id);
                task
                    .then(snapshot => snapshot.ref.getDownloadURL())
                    .then(url => {
                        updateProduct(url);
                    })
                    .catch(console.error);
            }
        }

        //Hàm cập nhật khách hàng
        function updateProduct(url) {
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
                }),
                contentType: "application/json",
                url: "http://localhost:8000/api/v1/khach-hang/" + id,
                success: function (data) {
                    loadingModalAndRefreshTable();
                    toastr.success('Khách hàng ' + data.userId + ' đã được chỉnh sửa.')
                },
                error: function (err) {
                    $('#loading-event-khach-hang').hide();
                    toastr.error('Đã có lỗi xảy ra. Cập nhật thất bại!!!')
                }
            });
        }

        //Hàm hiển thị loading trên modal, đóng modal và load lại table
        function loadingModalAndRefreshTable() {
            $('#loading-event-khach-hang').hide();
            $('.modal').each(function () {
                $(this).modal('hide');
            });
            $('#example2').DataTable().ajax.reload(null, false);
        }
    });

    let id_del = 0;

    //Hiển thị modal thông báo xóa khách hàng
    $('table').on('click', '.delete-btn', function () {
        let btn_id = this.id;
        id_del = btn_id.split("_")[2];
        $.ajax({
            type: 'GET',
            contentType: "application/json",
            url: 'http://localhost:8000/api/v1/khach-hang/' + id_del,
            success: function (data) {
                $("#modal-overlay .modal-body").text("Xóa khách hàng \"" + data.name + "\" ra khỏi danh sách?");
            },
            error: function (err) {
                alert("Error -> " + err);
            }
        });

    })

    //Xóa khách hàng theo id và xóa dòng liên quan trên bảng
    $(document).on("click", "#modal-accept-btn", function () {

        $('#loading-notification').show();

        deleteImageToStorageById(id_del);

        //Delete Object by id
        $.ajax({
            type: "DELETE",
            url: "http://localhost:8000/api/v1/khach-hang/" + id_del,
            success: function (data) {
                $('#loading-notification').hide();
                $('.modal').each(function () {
                    $(this).modal('hide');
                });
                $('#example2').DataTable().ajax.reload(null, false);
                toastr.success('Khách hàng \"' + id_del + '\" đã xóa ra khỏi danh sách.');
            },
            error: function (err) {
                $('#loading-event-khach-hang').hide();
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
            url: 'http://localhost:8000/api/v1/khach-hang/' + id,
            success: function (data) {
                // Create a reference to the file to delete
                var desertRef = firebase.storage().refFromURL(data.avatar);

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
                $(nRow).attr('id', 'tr_' + aData.userId); // or whatever you choose to set as the id
            },
            ajax: {
                url: "http://localhost:8000/api/v1/khach-hang",
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
                }
            }, {
                class: 'td_name',
                data: 'name'
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
            }, {
                class: 'td_phone',
                data: 'phone',
            },
                {
                    class: 'text-center',
                    data: 'userId',
                    render: function (data, type, row, meta) {
                        return '<button id="btn_edit_' + row.userId + '" class="btn bg-gradient-warning edit-btn" ' +
                            'data-toggle="modal" data-target="#modal-xl"><i class="fas fa-marker"></i></button>' +
                            '  <button id="btn_delete_' + row.userId + '" class="btn bg-gradient-danger delete-btn" ' +
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
    }

});