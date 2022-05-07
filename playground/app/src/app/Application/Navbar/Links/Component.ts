import { Component, Injector, OnInit } from "@angular/core";
import { ActivatedRoute } from "@angular/router";
import { AuthService, SubscriptionDirective } from "@valkyr/angular";
@Component({
  selector: "navbar-links",
  templateUrl: "./Template.html"
})
export class NavbarLinksComponent extends SubscriptionDirective implements OnInit {
  public links = [
    { name: "Workspaces", heading: "My Workspaces", href: "/workspaces" },
    { name: "Lists", heading: "My Lists", href: "/lists" },
    { name: "Items", heading: "My Items", href: "/items" }
  ];

  constructor(private route: ActivatedRoute, private auth: AuthService, injector: Injector) {
    super(injector);
  }

  public ngOnInit(): void {}

  public isCurrentRoute(route: string): boolean {
    return this.route.snapshot.url.some((u) => route.includes(u.path));
  }
}
