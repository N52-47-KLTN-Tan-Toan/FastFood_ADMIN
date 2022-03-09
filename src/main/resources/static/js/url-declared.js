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

const url_api_product = 'http://localhost:8000/api/v1/mat-hang'
const url_api_categories = 'http://localhost:8000/api/v1/loai-mat-hang'
const url_api_client = 'http://localhost:8000/api/v1/khach-hang'
const url_api_order = 'http://localhost:8000/api/v1/don-dat-hang'

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
    em_loading.hide();
    $('.modal').each(function () {
        $(this).modal('hide');
    });
    em_table.DataTable().ajax.reload(null, false);
}