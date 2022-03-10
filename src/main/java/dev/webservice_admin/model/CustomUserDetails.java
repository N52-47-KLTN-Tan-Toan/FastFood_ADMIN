package dev.webservice_admin.model;

import org.springframework.security.core.GrantedAuthority;
import org.springframework.security.core.authority.AuthorityUtils;
import org.springframework.security.core.userdetails.UserDetails;

import java.util.Collection;

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

    public String getFullName() {
        return this.nhanVien.getName();
    }

    public String getImage() {
        return this.nhanVien.getAvatar();
    }
}
