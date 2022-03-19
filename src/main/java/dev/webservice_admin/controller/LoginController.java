package dev.webservice_admin.controller;

import dev.webservice_admin.model.CustomUserDetails;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.stereotype.Controller;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;

@Controller
@RequestMapping("/")
public class LoginController {

    @GetMapping
    public String homePage(@AuthenticationPrincipal CustomUserDetails userDetails) {

//        String role = userDetails.getRole();
//
//        System.out.println(role);

        return "index";
    }

    @GetMapping(value = "/login")
    public String loginPage() {
        return "login";
    }

    @GetMapping(value = "/logoutSuccessful")
    public String logoutSuccessfulPage() {
        return "login";
    }

    @GetMapping(value = "/403")
    public String accessDenied() {
        return "403";
    }
}
