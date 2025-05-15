package src;

import com.sun.net.httpserver.HttpServer;
import java.io.IOException;
import java.net.InetSocketAddress;
import src.handlers.*;

public class Server {
  public static void main(String[] args) throws IOException {
    int port = 8080;
    HttpServer server = HttpServer.create(new InetSocketAddress(port), 0);

    // server.createContext("/places", new PlacesHandler());

    // mock data handler for below sample URL
    //   http:  localhost:8080/places?lat=41.8286671&lng=-71.4086326&radius=1000&keyword=cafe
    server.createContext("/places", new MockPlacesHandler());

    server.setExecutor(null);
    server.start();
    System.out.println("Server started on http://localhost:" + port + "/places");
  }
}
