import {ButtonStyle} from "discord.js";

export default class Utils {
    AllowedButtonStyle = [
        "Primary",
        "Secondary",
        "Success",
        "Danger",
    ]
    static ButtonStyles = {
        Primary: ButtonStyle.Primary,
        Secondary: ButtonStyle.Secondary,
        Success: ButtonStyle.Success,
        Danger: ButtonStyle.Danger,
    }
}