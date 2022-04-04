//Biến kết nối đến firebase
var firebaseConfig = {
    apiKey: "AIzaSyBSLLi7jGwomqntt2Ky0RnmIdk_wM0YGL0",
    authDomain: "n52-47-kltn-tan-toan.firebaseapp.com",
    projectId: "n52-47-kltn-tan-toan",
    storageBucket: "n52-47-kltn-tan-toan.appspot.com",
    messagingSenderId: "601210556956",
    appId: "1:601210556956:web:dc4df16ecb002d447085d9",
    measurementId: "G-J68P4KMT72"
};

//Khai báo biến toast để hiển thị thông báo
var Toast = Swal.mixin({
    toast: true,
    position: 'top-end',
    showConfirmButton: false,
    timer: 5000
});

var userId = $('#userId').val()

const url_api_product = 'http://localhost:8000/api/v1/mat-hang'
const url_api_categories = 'http://localhost:8000/api/v1/loai-mat-hang'
const url_api_client = 'http://localhost:8000/api/v1/khach-hang'
const url_api_order = 'http://localhost:8000/api/v1/don-dat-hang'
const url_api_introduce = 'http://localhost:8000/api/v1/gioi-thieu'
const url_api_orderdetail = 'http://localhost:8000/api/v1/chi-tiet-don-dat-hang'
const url_api_staff = 'http://localhost:8000/api/v1/nhan-vien'

//Hàm xóa hình ảnh trên firebase storage dựa trên tìm kiếm id của đối tượng
function deleteImageToStorageById(id_object, url_object) {

    //Find Object by id
    $.ajax({
        type: 'GET',
        contentType: "application/json",
        url: url_object + '/' + id_object,
        success: function (data) {
            // Create a reference to the file to delete
            var desertRef = firebase.storage().refFromURL(data.hinhAnh);

            // Delete the file
            desertRef.delete().then(function () {
                // console.log("Delete file in firebase storage successfully");
            }).catch(function (error) {

            });
        },
        error: function (err) {

        }
    });
}

//Hàm hiển thị loading trên modal, đóng modal và load lại table
function loadingModalAndRefreshTable(em_loading, em_table) {
    em_loading.hide()
    $('.modal').each(function () {
        $(this).modal('hide')
    })
    em_table.DataTable().ajax.reload(null, false)
}

//Upload File
function uploadFileExcel(url_api) {
    $("#form-upload-file").on('submit', function (evt) {
        evt.preventDefault()

        let formData = new FormData()
        formData.append("file", exampleInputFile.files[0])

        $.ajax({
            type: 'POST',
            enctype: 'multipart/form-data',
            url: url_api + '/upload',
            data: formData,
            processData: false,
            contentType: false,
            success: function (res) {
                toastr.success(res.message)
                $('#example2').DataTable().ajax.reload(null, false)
                $('.modal').each(function () {
                    $(this).modal('hide')
                })
            },
            error: function (err) {
                toastr.error('Kích cỡ file lớn hơn 50MB hoặc không đúng định dạng file Excel (.xlsx)')
            },
            complete: function (data) {
                $('#form-upload-file')[0].reset(); // this will reset the form fields
            }
        })
    })
}

// Hàm bắt validation bằng jquery
// Tham số truyền vào bao gồm
// + form cần truyền vào
// + ràng buộc
// + thông báo xuất ra
function validateForm(form, rules, mess) {
    form.validate({
        rules: rules, // Các ràng buộc
        messages: mess, // Thông báo xuất hiện
        errorElement: 'span',
        errorPlacement: function (error, element) {
            error.addClass('invalid-feedback')
            element.closest('.form-group').append(error)
        },
        highlight: function (element, errorClass, validClass) {
            $(element).addClass('is-invalid')
        },
        unhighlight: function (element, errorClass, validClass) {
            $(element).removeClass('is-invalid')
        }
    })
}

$(document).ready(function () {
    //Initialize Select2 Elements
    $('.select2').select2()
    var current = location.pathname

    $('#left-menu li a').each(function () {
        var $this = $(this)
        // if the current path is like this link, make it active
        if (current === "/") {
            // $this.addClass('active');
            return false;
        }
        if ($this.attr('href').indexOf(current) !== -1) {
            $this.addClass('active');
        }
    })

    bsCustomFileInput.init();
})
