class Money
  CURRENCY_SYMBOLS = {
    "USD" => "$",
    "CAD" => "C$",
    "AUD" => "A$",
    "NZD" => "NZ$",
    "EUR" => "&euro;",
    "GBP" => "&pound;",
    "JPY" => "&yen;",
  }
  def cent_part
    (cents % 100).floor
  end
  def dollar_part
    (cents / 100).floor
  end
  def symbol
    CURRENCY_SYMBOLS[currency] or "#{currency} "
  end
  def format(*rules)
    if rules.first == :minimal
      formatted = "#{symbol}#{dollar_part}"
      formatted << ".#{cent_part}" if cent_part > 0
      formatted
    else
      super(*rules)
    end
  end
end