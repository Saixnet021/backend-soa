package com.exporsan.auth.dto;

public class ValidateResponse {

    private boolean valid;
    private String username;
    private String rol;

    public ValidateResponse() {
    }

    public ValidateResponse(boolean valid, String username, String rol) {
        this.valid = valid;
        this.username = username;
        this.rol = rol;
    }

    public boolean isValid() {
        return valid;
    }

    public void setValid(boolean valid) {
        this.valid = valid;
    }

    public String getUsername() {
        return username;
    }

    public void setUsername(String username) {
        this.username = username;
    }

    public String getRol() {
        return rol;
    }

    public void setRol(String rol) {
        this.rol = rol;
    }
}
