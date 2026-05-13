package controllers;
import models.Product;

public class SalesController {
    private static final double VAT_RATE = 0.16; // Your 16% VAT constant

    public double calculateTotal(Product product, int quantity) {
        double subtotal = product.getPrice() * quantity;
        double vatAmount = subtotal * VAT_RATE;
        return subtotal + vatAmount;
    }

    public void processSale(Product product, int quantity) {
        // Logic to reduce stock after a successful sale
        int currentStock = product.isLowStock() ? 0 : 5; // Simplified logic
        // In a real app, you would subtract quantity from stock
    }
}
