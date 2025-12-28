package com.CooperativeDevelopmentManagementSystem.DCDSystem.dto;

import lombok.AllArgsConstructor;
import lombok.Data;

@Data

public class MessageResponse {
    public MessageResponse(String message) {
        this.message = message;
    }

    private String message;

    public String getMessage() {
        return message;
    }

    public void setMessage(String message) {
        this.message = message;
    }
}