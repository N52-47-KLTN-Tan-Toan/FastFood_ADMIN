$(document).ready(function () {

    var newpass = $('#new-password')
    var repass = $('#re-password')

    var bcrypt = dcodeIO.bcrypt;

    /** One way, can't decrypt but can compare */
    var salt = bcrypt.genSaltSync(10);

    $('.form-change-pass').submit(function (evt) {
        evt.preventDefault()

        if (repass.val() != newpass.val()) {
            return false
        }

        if (!newpass.val().match(/^(?=.*\d)(?=.*[a-z])(?=.*[A-Z])[0-9a-zA-Z]{8,}$/)) {
            return false
        }
        $.ajax({
            type: 'GET',
            contentType: "application/json",
            url: url_api_staff + '/' + userId,
            success: function (data) {
                bcrypt.hash(repass.val(), salt, (err, res) => {
                    $.ajax({
                        type: "PUT",
                        data: JSON.stringify({
                            name: data.name,
                            birthDate: data.birthDate,
                            phone: data.phone,
                            email: data.email,
                            address: data.address,
                            gender: data.gender,
                            avatar: data.avatar,
                            username: data.username,
                            roleName: data.roleName,
                            password: res,
                        }),
                        contentType: "application/json",
                        url: url_api_staff + '/' + userId,
                        success: function (data) {
                            toastr.success('Thay đổi mật khẩu thành công')
                        },
                        error: function (err) {
                            toastr.error('Quá nhiều yêu cầu. Vui lòng thử lại sau')
                        }
                    })
                })
            },
            error: function (err) {
                alert("Error -> " + err)
            }
        })
    })

    $('#new-password').keyup(function () {
        if (!newpass.val().match(/^(?=.*\d)(?=.*[a-z])(?=.*[A-Z])[0-9a-zA-Z]{8,}$/)) {
            $('#regex-password').text('Mật khẩu phải tối thiểu 8 ký tự bao gồm 1 ký tự in hoa, 1 ký tự thường và 1 ký tự số')
            return false
        } else {
            $('#regex-password').text('')
            return true
        }
    })

    $('#new-password, #re-password').keyup(function () {
        if (repass.val() != newpass.val()) {
            $('#regex-repassword').text('Mật khẩu không khớp')
            return false
        } else {
            $('#regex-repassword').text('')
            return true
        }
    })

})

function showHidePassword() {
    var x = $('#new-password')
    var y = $('#re-password')

    if (x.attr('type') === "password" && y.attr('type') === "password") {
        x.attr('type', 'text')
        y.attr('type', 'text')
    } else {
        x.attr('type', 'password')
        y.attr('type', 'password')
    }
}