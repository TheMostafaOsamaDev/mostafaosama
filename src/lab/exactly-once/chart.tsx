import type { OnceResult } from "./model";

const money = (n: number) => `$${n.toLocaleString("en")}`;

/**
 * One row per payment, a dot per delivery on a shared time axis (a trace, like the rest of the site).
 * First deliveries are solid; redeliveries are rings in the error color. Pure markup, so the lab
 * index can render it on the server.
 */
export function OnceChart({ result, compact = false }: { result: OnceResult; compact?: boolean }) {
  const end = Math.max(...result.log.map((d) => d.at)) + 0.5;
  const byPayment = new Map(result.payments.map((p) => [p.id, [] as { at: number; attempt: number; index: number }[]]));
  result.log.forEach((d, index) => byPayment.get(d.id)!.push({ at: d.at, attempt: d.attempt, index }));

  return (
    <div className={compact ? "" : "overflow-x-auto"}>
      <table className={`w-full tabular-nums ${compact ? "" : "min-w-[21rem]"}`}>
        {compact ? null : (
          <thead>
            <tr className="text-left text-small text-muted">
              <th scope="col" className="pb-2 font-normal">
                Payment
              </th>
              <th scope="col" className="pb-2 font-normal">
                <span className="max-sm:sr-only">Deliveries over time</span>
                <span className="sm:hidden" aria-hidden>
                  Deliveries
                </span>
              </th>
              <th scope="col" className="pb-2 text-right font-normal">
                No key
              </th>
              <th scope="col" className="pb-2 text-right font-normal">
                With key
              </th>
            </tr>
          </thead>
        )}
        <tbody>
          {result.payments.map((p) => {
            const dots = byPayment.get(p.id)!;
            const charged = dots.reduce((s, d) => s + result.withoutKey.charges[d.index], 0);
            const chargedWithKey = dots.reduce((s, d) => s + result.withKey.charges[d.index], 0);
            return (
              <tr key={p.id} className={compact ? "" : "border-t border-hairline"}>
                {compact ? null : (
                  <th scope="row" className="py-1.5 pr-4 text-left text-small font-normal whitespace-nowrap">
                    {p.id} <span className="text-muted">{money(p.amount)}</span>
                  </th>
                )}
                <td className={`w-full ${compact ? "py-[3px]" : "py-1.5 pr-4"}`}>
                  <div className="relative mx-1.5 h-2.5">
                    <span className="absolute inset-x-0 top-1/2 border-t border-dashed border-hairline" />
                    {dots.map((d) => (
                      <span
                        key={d.attempt}
                        data-dot
                        data-order={d.index}
                        className={`absolute top-0 size-2.5 -translate-x-1/2 rounded-full ${
                          d.attempt === 1 ? "bg-ink" : "border-2 border-err bg-paper"
                        }`}
                        style={{ left: `${(d.at / end) * 100}%` }}
                      />
                    ))}
                  </div>
                </td>
                {compact ? null : (
                  <>
                    <td className={`py-1.5 pr-1 text-right text-small ${charged > p.amount ? "text-err" : ""}`}>
                      {money(charged)}
                    </td>
                    <td className="py-1.5 pl-4 text-right text-small">{money(chargedWithKey)}</td>
                  </>
                )}
              </tr>
            );
          })}
        </tbody>
        {compact ? null : (
          <tfoot>
            <tr className="border-t border-ink text-small">
              <th scope="row" className="pt-2 text-left font-semibold">
                Total
              </th>
              <td className="pt-2 text-muted">
                {result.log.length} deliveries for {result.payments.length} payments
              </td>
              <td
                className={`pt-2 pr-1 text-right font-semibold ${result.withoutKey.total > result.expected ? "text-err" : ""}`}
              >
                {money(result.withoutKey.total)}
              </td>
              <td className="pt-2 pl-4 text-right font-semibold">{money(result.withKey.total)}</td>
            </tr>
          </tfoot>
        )}
      </table>
    </div>
  );
}
