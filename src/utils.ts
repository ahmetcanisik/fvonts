export class Utils {
    /**
     * Bir font adını alır ve her kelimenin ilk harfini büyük harfe çevirir.
     * Örneğin: "example-font" -> "Example Font"
     * @param templateName Font adı
     * @returns Büyük harflerle formatlanmış font adı
     */
    static capitalizeFontName(templateName: string): string {
        return templateName
            .split('-')
            .map(word => word.charAt(0).toUpperCase() + word.slice(1))
            .join(' ');
    }

    /**
     * Bir string içindeki özel regex karakterlerini kaçar.
     * Örneğin: "example.string" -> "example\\.string"
     * @param str Kaçırılacak string
     * @returns Kaçırılmış string
     */
    static escapeRegex(str: string): string {
        return str.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
    }
}