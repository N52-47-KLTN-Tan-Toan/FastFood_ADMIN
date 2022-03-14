package dev.webservice_admin.controller;

import org.springframework.stereotype.Controller;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;

@Controller
@RequestMapping("/introduce")
public class IntroduceController {

    @GetMapping
    public String home() {
        return "introduce";
    }

}
