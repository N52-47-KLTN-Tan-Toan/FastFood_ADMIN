package dev.webservice_admin.controller;

import dev.webservice_admin.service.DonDatHangService;
import dev.webservice_admin.service.KhachHangService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Controller;
import org.springframework.ui.Model;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.RequestMapping;

@Controller
@RequestMapping("/createOrder")
public class CreateOrderContronller {

    @Autowired
    private KhachHangService khachHangService;

    @Autowired
    private DonDatHangService donDatHangService;

    @GetMapping("/customer/{cid}/order/{oid}")
    public String createOrderPage(Model model,  @PathVariable String cid, @PathVariable String oid){
        model.addAttribute("customer", khachHangService.findById(cid));
        model.addAttribute("order_product", donDatHangService.findById(Long.valueOf(oid)));
        return "order-create-form";
    }

}
