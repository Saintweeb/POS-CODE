package db;

import java.sql.Connection;
import java.sql.DriverManager;
import java.sql.SQLException;

public class DatabaseConfig {
    // The location of your database file in the project root
    private static final String URL = "jdbc:sqlite:schoolfix_pos.db";

    /**
     * Establishes a connection to the SQLite database.
     * @return Connection object
     */
    public static Connection getConnection() {
        Connection conn = null;
        try {
            // Attempt to connect to the database file
            conn = DriverManager.getConnection(URL);
            System.out.println("Connection to SQLite has been established.");
        } catch (SQLException e) {
            // Log the error for maintenance and security auditing
            System.err.println("Database Connection Error: " + e.getMessage());
        }
        return conn;
    }
}
