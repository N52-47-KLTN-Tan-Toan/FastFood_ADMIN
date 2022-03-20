package dev.webservice_admin.model;

import org.springframework.security.core.GrantedAuthority;
import org.springframework.security.core.authority.AuthorityUtils;
import org.springframework.security.core.userdetails.UserDetails;

import java.time.LocalDate;
import java.util.Collection;
import java.util.UUID;

public class CustomUserDetails implements UserDetails {

    private NhanVien nhanVien;

    public CustomUserDetails(NhanVien nhanVien) {
        this.nhanVien = nhanVien;
    }

    @Override
    public Collection<? extends GrantedAuthority> getAuthorities() {
        return AuthorityUtils.commaSeparatedStringToAuthorityList(nhanVien.getRoleName());
    }

    @Override
    public String getPassword() {
        return nhanVien.getPassword();
    }

    @Override
    public String getUsername() {
        return nhanVien.getUsername();
    }

    @Override
    public boolean isAccountNonExpired() {
        return true;
    }

    @Override
    public boolean isAccountNonLocked() {
        return true;
    }

    @Override
    public boolean isCredentialsNonExpired() {
        return true;
    }

    @Override
    public boolean isEnabled() {
        return true;
    }

    public UUID getUuid(){
        return this.nhanVien.getUserId();
    }

    public String getFullName() {
        return this.nhanVien.getName();
    }

    public String getImage() {
        return this.nhanVien.getAvatar();
    }

    public String getRole() {
        return this.nhanVien.getRoleName();
    }

    public String getGender(){
        return this.nhanVien.getGender() == true ? "Nam" : "Nữ";
    }

    public String getAddress(){
        return this.nhanVien.getAddress();
    }

    public String getPhone(){
        return this.nhanVien.getPhone();
    }

    public String getEmail(){
        return this.nhanVien.getEmail();
    }

    public String getBirthDate(){
        return this.nhanVien.getBirthDate().getDayOfMonth() + "/" + this.nhanVien.getBirthDate().getMonthValue() + "/" +
                this.nhanVien.getBirthDate().getYear();
    }
}
