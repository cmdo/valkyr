import { Component } from "@angular/core";
import { Menu } from "@valkyr/angular";

@Component({
  selector: "discovery",
  templateUrl: "./Template.html",
  styleUrls: ["./Style.scss"]
})
export class DiscoveryComponent {
  aside!: Menu;

  constructor() {
    this.#loadMenu();
  }

  #loadMenu() {
    this.aside = new Menu({
      categories: [
        {
          name: "Workspaces",
          items: [
            {
              name: "Workspaces",
              href: "/workspaces"
            }
          ]
        },
        {
          name: "Sandbox",
          items: [
            {
              name: "Text Editor",
              href: "/editor"
            }
          ]
        }
      ]
    });
  }
}
