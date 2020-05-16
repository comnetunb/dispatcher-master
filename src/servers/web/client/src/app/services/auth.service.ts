import { Injectable } from "@angular/core";
import User, { IUser } from "../../../../../../database/models/user";
import { HttpClient } from "@angular/common/http";
import { Observable, BehaviorSubject } from "rxjs";
import { map, tap } from "rxjs/operators";
import { ActivatedRoute, Router } from "@angular/router";
import { UserService } from "./user.service";
import { RegisterUserRequest } from "../../../../api/register-user-request";
import { LoginResponse } from "../../../../api/login-response";

const apiRoute = "/api/users";

@Injectable({
  providedIn: "root",
})
export class AuthService {
  private currentUserSubject: BehaviorSubject<IUser>;
  private currentTokenSubject: BehaviorSubject<string>;
  private currentAdminModeSubject: BehaviorSubject<boolean>;

  public currentUser: Observable<IUser>;
  public currentToken: Observable<string>;
  public currentAdminMode: Observable<boolean>;

  public redirectUrl: string;

  constructor(
    private http: HttpClient,
    private router: Router,
    private userService: UserService
  ) {
    this.currentUserSubject = new BehaviorSubject<IUser>(
      JSON.parse(localStorage.getItem("currentUser"))
    );
    this.currentUser = this.currentUserSubject.asObservable();

    this.currentTokenSubject = new BehaviorSubject<string>(
      localStorage.getItem("currentToken")
    );
    this.currentToken = this.currentTokenSubject.asObservable();

    this.currentAdminModeSubject = new BehaviorSubject<boolean>(
      localStorage.getItem("adminMode") === "true"
    );
    this.currentAdminMode = this.currentAdminModeSubject.asObservable();
  }

  public get currentUserValue(): IUser {
    return this.currentUserSubject.value;
  }

  public get token(): string {
    return this.currentTokenSubject.value;
  }

  public get adminMode(): boolean {
    return this.currentAdminModeSubject.value;
  }

  private storeUser(user: IUser, token?: string) {
    // store user details and jwt token in local storage to keep user logged in between page refreshes
    localStorage.setItem("currentUser", JSON.stringify(user));
    this.currentUserSubject.next(user);

    if (token) {
      localStorage.setItem("currentToken", token);
      this.currentTokenSubject.next(token);
    }
  }

  private eraseStorage(): void {
    // remove user from local storage and set current user to null
    localStorage.removeItem("currentUser");
    localStorage.removeItem("currentToken");
    this.currentUserSubject.next(null);
    this.currentTokenSubject.next(null);
    this.router.navigate(["/"]);
  }

  refresh() {
    const sub = this.http.get<IUser>(`${apiRoute}/signed_in`).subscribe(
      (user) => {
        if (user == null) {
          this.eraseStorage();
        } else {
          this.storeUser(user);
        }
        sub.unsubscribe();
      },
      (error) => {
        if (error.status == 401) {
          this.eraseStorage();
        }
        sub.unsubscribe();
      }
    );
  }

  register(request: RegisterUserRequest) {
    return this.userService.registerUser(request).pipe(
      map((res) => {
        if (res == null || res.user == null) {
          return this.eraseStorage();
        }

        this.storeUser(res.user, res.token);
        this.router.navigate(["/dashboard"]);
      })
    );
  }

  login(username: string, password: string) {
    return this.http
      .post<LoginResponse>(`${apiRoute}/sign_in`, { username, password })
      .pipe(
        map((res) => {
          if (res == null || res.user == null) {
            return this.eraseStorage();
          }

          this.storeUser(res.user, res.token);
          this.router.navigate(["/dashboard"]);
        })
      );
  }

  logout() {
    this.http
      .post(`${apiRoute}/sign_out`, {}, { responseType: "text" })
      .subscribe(() => {
        this.eraseStorage();
      });
  }

  setAdminMode(mode: boolean) {
    if (!this.currentUserValue) return;
    if (!this.currentUserValue.admin) return;

    this.currentAdminModeSubject.next(mode);
  }
}
