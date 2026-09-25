import { formatPartialDate, formatRange, type Resume } from "@/lib/about/resume";

function Heading({ children }: { children: string }) {
  return (
    <h2 className="text-eyebrow text-muted-foreground mb-4 border-b pb-2 print:mb-2 print:pb-1">
      {children}
    </h2>
  );
}

/** Experience, education, skills and languages, laid out for screen and paper alike. */
export function ResumeSections({ resume }: { resume: Resume }) {
  return (
    <div className="grid gap-10 print:gap-5">
      <section>
        <Heading>Experience</Heading>
        <ol className="grid gap-6 print:gap-3">
          {resume.work.map((role) => (
            <li
              key={`${role.organization}-${role.start}`}
              className="grid gap-1 break-inside-avoid sm:grid-cols-[9rem_1fr] sm:gap-6"
            >
              <p className="text-muted-foreground font-mono text-xs sm:pt-1">
                {formatRange(role.start, role.end)}
              </p>
              <div className="grid gap-1.5">
                <h3 className="font-semibold">
                  {role.position},{" "}
                  {role.url ? (
                    <a href={role.url} className="underline-offset-4 hover:underline">
                      {role.organization}
                    </a>
                  ) : (
                    role.organization
                  )}
                </h3>
                {role.summary && <p className="text-muted-foreground text-sm">{role.summary}</p>}
                {role.highlights && role.highlights.length > 0 && (
                  <ul className="list-disc space-y-1 pl-5 text-sm">
                    {role.highlights.map((highlight) => (
                      <li key={highlight}>{highlight}</li>
                    ))}
                  </ul>
                )}
              </div>
            </li>
          ))}
        </ol>
      </section>

      {resume.education && resume.education.length > 0 && (
        <section>
          <Heading>Education</Heading>
          <ul className="grid gap-3">
            {resume.education.map((item) => (
              <li
                key={item.institution}
                className="grid gap-1 break-inside-avoid sm:grid-cols-[9rem_1fr] sm:gap-6"
              >
                <p className="text-muted-foreground font-mono text-xs sm:pt-1">
                  {formatRange(item.start, item.end)}
                </p>
                <p>
                  <span className="font-semibold">{item.institution}</span>
                  {(item.studyType || item.area) && (
                    <span className="text-muted-foreground">
                      {" "}
                      · {[item.studyType, item.area].filter(Boolean).join(", ")}
                    </span>
                  )}
                </p>
              </li>
            ))}
          </ul>
        </section>
      )}

      {resume.skills && resume.skills.length > 0 && (
        <section>
          <Heading>Skills</Heading>
          <dl className="grid gap-2 text-sm">
            {resume.skills.map((skill) => (
              <div key={skill.name} className="grid gap-1 sm:grid-cols-[9rem_1fr] sm:gap-6">
                <dt className="font-semibold">{skill.name}</dt>
                <dd className="text-muted-foreground">{skill.keywords.join(" · ")}</dd>
              </div>
            ))}
          </dl>
        </section>
      )}

      {((resume.languages?.length ?? 0) > 0 || (resume.awards?.length ?? 0) > 0) && (
        <section className="grid gap-8 sm:grid-cols-2 print:grid-cols-2">
          {resume.languages && resume.languages.length > 0 && (
            <div>
              <Heading>Languages</Heading>
              <ul className="grid gap-1 text-sm">
                {resume.languages.map((item) => (
                  <li key={item.language}>
                    {item.language}
                    {item.fluency && (
                      <span className="text-muted-foreground"> · {item.fluency}</span>
                    )}
                  </li>
                ))}
              </ul>
            </div>
          )}
          {resume.awards && resume.awards.length > 0 && (
            <div>
              <Heading>Awards</Heading>
              <ul className="grid gap-1 text-sm">
                {resume.awards.map((award) => (
                  <li key={award.title}>
                    {award.title}
                    {award.date && (
                      <span className="text-muted-foreground">
                        {" "}
                        · {formatPartialDate(award.date)}
                      </span>
                    )}
                  </li>
                ))}
              </ul>
            </div>
          )}
        </section>
      )}
    </div>
  );
}
