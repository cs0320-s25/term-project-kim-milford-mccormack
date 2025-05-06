
package src;

import com.sun.net.httpserver.HttpServer;
import src.handlers.PlacesHandler;
import java.io.IOException;
import java.net.InetSocketAddress;

public class Server {
  public static void main(String[] args) throws IOException {
    int port = 8080;
    HttpServer server = HttpServer.create(new InetSocketAddress(port), 0);

    server.createContext("/places", new PlacesHandler());

    server.setExecutor(null);
    server.start();
    System.out.println("Server started on http://localhost:" + port + "/places");
  }
}
