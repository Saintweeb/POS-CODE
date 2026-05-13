package models;

public class Product {
    private int id;
    private String name;
    private double price;
    private int stock;

    // The Constructor
    public Product(int id, String name, double price, int stock) {
        this.id = id;
        this.name = name;
        this.price = price;
        this.stock = stock;
    }

    // Business Logic: Check for low stock (as per your LOW = 5 rule)
    public boolean isLowStock() {
        return this.stock <= 5;
    }

    // Getters and Setters (to allow the Controller to access data)
    public double getPrice() { return price; }
    public void setStock(int newStock) { this.stock = newStock; }
}
