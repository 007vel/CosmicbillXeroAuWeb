
export class stringhelper {
    public static IsNullOrEmptyOrDefault(str: any = ""): boolean {
        if (str == null || str == "" || str == undefined || str == "undefined" || str == 'null') {
            return true;
        }
        return false;
    }
}